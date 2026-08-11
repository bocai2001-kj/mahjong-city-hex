"use strict";

const defaultOperations = require("./core.cjs");

function createHandler(repository, operations = defaultOperations) {
  const actions = {
    create: (event) => operations.createRoom(repository, { mode: event.mode }),
    get: (event) => operations.getRoom(repository, { code: event.code }),
    join: (event) => operations.joinRoom(repository, {
      code: event.code,
      seat: event.seat,
      token: event.token,
    }),
    select: (event) => operations.selectHex(repository, {
      code: event.code,
      seat: event.seat,
      token: event.token,
    }),
    next: (event) => operations.nextRound(repository, {
      code: event.code,
      hostToken: event.hostToken,
    }),
  };

  return async (event = {}) => {
    try {
      const action = actions[event.action];
      if (!action) throw new Error("invalid_action");
      return { ok: true, data: await action(event) };
    } catch (error) {
      const message = error instanceof Error ? error.message : error?.message;
      return { ok: false, error: message || "unknown_error" };
    }
  };
}

module.exports = { createHandler };
