import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("production client does not depend on blocked overseas service domains", async () => {
  const client = await readFile(new URL("../app/lib/room-client.ts", import.meta.url), "utf8").catch(() => "");

  assert.doesNotMatch(client, /supabase\.co|vercel\.app/i);
  assert.match(client, /const apiUrl = "\/mahjong-room"/);
});

test("HTTP route adapter accepts JSON requests and returns CORS responses", async () => {
  const httpModule = await import("../cloudfunctions/mahjong-room/http.cjs").catch(() => null);
  assert.ok(httpModule, "CloudBase HTTP adapter has not been implemented");

  const request = httpModule.parseRequest({
    httpMethod: "POST",
    body: JSON.stringify({ action: "create", mode: "xiamen" }),
  });
  assert.deepEqual(request, { action: "create", mode: "xiamen" });

  const response = httpModule.httpResponse({ ok: true, data: { room: { code: "123456" } } });
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["Access-Control-Allow-Origin"], "*");
  assert.equal(JSON.parse(response.body).data.room.code, "123456");
});

test("CloudBase room core is available for the domestic deployment", async () => {
  const moduleUrl = new URL("../cloudfunctions/mahjong-room/core.cjs", import.meta.url);
  const core = await import(moduleUrl).catch(() => null);

  assert.ok(core, "CloudBase room core has not been implemented");
  assert.equal(typeof core.createRoom, "function");
  assert.equal(typeof core.joinRoom, "function");
  assert.equal(typeof core.selectHex, "function");
  assert.equal(typeof core.nextRound, "function");
});
