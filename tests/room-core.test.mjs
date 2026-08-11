import assert from "node:assert/strict";
import test from "node:test";
import core from "../cloudfunctions/mahjong-room/core.cjs";

function memoryRepository() {
  const rooms = new Map();
  const players = new Map();
  const playerKey = (code, seat) => `${code}-${seat}`;

  return {
    async getRoom(code) {
      return rooms.get(code) ?? null;
    },
    async insertRoom(room) {
      if (rooms.has(room.code)) return false;
      rooms.set(room.code, structuredClone(room));
      return true;
    },
    async updateRoom(code, patch) {
      rooms.set(code, { ...rooms.get(code), ...structuredClone(patch) });
    },
    async listPlayers(code) {
      return [...players.values()]
        .filter((player) => player.roomCode === code)
        .map((player) => structuredClone(player));
    },
    async getPlayer(code, seat) {
      return structuredClone(players.get(playerKey(code, seat)) ?? null);
    },
    async insertPlayer(player) {
      const key = playerKey(player.roomCode, player.seat);
      if (players.has(key)) return false;
      players.set(key, structuredClone(player));
      return true;
    },
    async updatePlayer(code, seat, patch) {
      const key = playerKey(code, seat);
      players.set(key, { ...players.get(key), ...structuredClone(patch) });
    },
  };
}

test("four-player room lifecycle works with numeric codes and random hex draws", async () => {
  const repository = memoryRepository();
  const created = await core.createRoom(repository, { mode: "xiamen" });

  assert.match(created.room.code, /^\d{6}$/);
  assert.equal(created.room.round, 1);
  assert.deepEqual(created.room.players, []);

  const eastToken = "11111111-1111-4111-8111-111111111111";
  const joined = await core.joinRoom(repository, {
    code: created.room.code,
    seat: "东",
    token: eastToken,
  });
  assert.equal(joined.selected, null);
  assert.equal("candidates" in joined, false);

  await assert.rejects(
    core.joinRoom(repository, {
      code: created.room.code,
      seat: "东",
      token: "22222222-2222-4222-8222-222222222222",
    }),
    /seat_taken/,
  );

  const locked = await core.selectHex(repository, {
    code: created.room.code,
    seat: "东",
    token: eastToken,
  }, () => 0.6);
  assert.equal(locked.selected.origin, "厦门专属");
  assert.ok(locked.selected.name);

  await assert.rejects(
    core.selectHex(repository, {
      code: created.room.code,
      seat: "东",
      token: eastToken,
    }),
    /already_selected/,
  );

  await assert.rejects(
    core.nextRound(repository, {
      code: created.room.code,
      hostToken: "33333333-3333-4333-8333-333333333333",
    }),
    /host_verification_failed/,
  );

  const advanced = await core.nextRound(repository, {
    code: created.room.code,
    hostToken: created.hostToken,
  });
  assert.equal(advanced.round, 2);

  const restored = await core.joinRoom(repository, {
    code: created.room.code,
    seat: "东",
    token: eastToken,
  });
  assert.equal(restored.round, 2);
  assert.equal(restored.selected, null);
  assert.equal("candidates" in restored, false);
});
