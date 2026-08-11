const { createHandler } = require("./handler.cjs");
const { httpResponse, isHttpRequest, parseRequest } = require("./http.cjs");
const { createRepository } = require("./repository.cjs");
const { createSqlClient } = require("./sql-client.cjs");

const envId = process.env.TCB_ENV || "lyw599-d2gxronq4dd537da0";
const region = process.env.TENCENTCLOUD_REGION || "ap-shanghai";
const handleRoomAction = createHandler(createRepository(createSqlClient({ envId, region })));

exports.main = async (event) => {
  if (!isHttpRequest(event)) return handleRoomAction(event);
  if (event.httpMethod === "OPTIONS") return httpResponse({ ok: true });
  return httpResponse(await handleRoomAction(parseRequest(event)));
};
