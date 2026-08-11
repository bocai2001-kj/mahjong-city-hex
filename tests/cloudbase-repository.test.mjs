import assert from "node:assert/strict";
import test from "node:test";

function row(columns, values) {
  return { Columns: columns, Rows: [JSON.stringify(values)] };
}

test("CloudBase SQL repository persists rooms and seat records", async () => {
  const { createRepository } = await import("../cloudfunctions/mahjong-room/repository.cjs");
  const calls = [];
  const responses = [
    { AffectedRows: 1, Columns: ["code"], Rows: [] },
    { AffectedRows: 0, Columns: ["code"], Rows: [] },
    row(["payload"], [{ code: "123456", round: 1 }]),
    row(["payload"], [{ code: "123456", round: 1 }]),
    { Columns: null, Rows: null },
    row(["payload"], [{ code: "123456", round: 2 }]),
    { AffectedRows: 1, Columns: ["id"], Rows: [] },
    { AffectedRows: 0, Columns: ["id"], Rows: [] },
    row(["payload"], [{ roomCode: "123456", seat: "east", seatToken: "token", selected: null }]),
    row(["payload"], [{ roomCode: "123456", seat: "east", seatToken: "token", selected: null }]),
    { Columns: null, Rows: null },
    row(["payload"], [{ roomCode: "123456", seat: "east", selected: { name: "test" } }]),
  ];
  const repository = createRepository(async (sql) => {
    calls.push(sql);
    return responses.shift();
  });

  assert.equal(await repository.insertRoom({ code: "123456", round: 1 }), true);
  assert.equal(await repository.insertRoom({ code: "123456", round: 1 }), false);
  assert.equal((await repository.getRoom("123456")).round, 1);
  await repository.updateRoom("123456", { round: 2 });
  assert.equal((await repository.getRoom("123456")).round, 2);

  const player = { roomCode: "123456", seat: "east", seatToken: "token", selected: null };
  assert.equal(await repository.insertPlayer(player), true);
  assert.equal(await repository.insertPlayer(player), false);
  assert.equal((await repository.getPlayer("123456", "east")).seatToken, "token");
  await repository.updatePlayer("123456", "east", { selected: { name: "test" } });
  assert.equal((await repository.listPlayers("123456"))[0].selected.name, "test");

  assert.equal(responses.length, 0);
  assert.match(calls[0], /ON CONFLICT DO NOTHING RETURNING code/);
  assert.match(calls.at(-1), /WHERE room_code = '123456'/);
});

test("SQL repository safely quotes values", async () => {
  const { quote } = await import("../cloudfunctions/mahjong-room/repository.cjs");
  assert.equal(quote("O'Brien"), "'O''Brien'");
});
