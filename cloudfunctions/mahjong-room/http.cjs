"use strict";

function isHttpRequest(event) {
  return Boolean(event?.httpMethod || event?.requestContext?.httpMethod);
}

function parseRequest(event) {
  if (!isHttpRequest(event)) return event ?? {};
  if (!event.body) return {};
  const body = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  return typeof body === "string" ? JSON.parse(body) : body;
}

function httpResponse(result) {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(result),
  };
}

module.exports = { httpResponse, isHttpRequest, parseRequest };
