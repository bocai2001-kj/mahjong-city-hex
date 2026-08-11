import assert from "node:assert/strict";
import test from "node:test";

test("CloudBase handler dispatches room actions and returns safe errors", async () => {
  const handlerModule = await import("../cloudfunctions/mahjong-room/handler.cjs").catch(() => null);
  assert.ok(handlerModule, "CloudBase handler has not been implemented");

  const calls = [];
  const operations = {
    createRoom: async (_repository, payload) => {
      calls.push(payload);
      return { room: { code: "123456" }, hostToken: "host" };
    },
  };
  const handler = handlerModule.createHandler({}, operations);

  assert.deepEqual(await handler({ action: "create", mode: "longyan" }), {
    ok: true,
    data: { room: { code: "123456" }, hostToken: "host" },
  });
  assert.deepEqual(calls, [{ mode: "longyan" }]);
  assert.deepEqual(await handler({ action: "missing" }), {
    ok: false,
    error: "invalid_action",
  });
});
