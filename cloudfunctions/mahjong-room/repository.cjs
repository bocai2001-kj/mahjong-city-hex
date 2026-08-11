"use strict";

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function json(value) {
  return `${quote(JSON.stringify(value))}::jsonb`;
}

function decodeRows(result) {
  const columns = result?.Columns ?? [];
  return (result?.Rows ?? []).map((row) => {
    const values = typeof row === "string" ? JSON.parse(row) : row;
    return Object.fromEntries(columns.map((column, index) => [column, values[index]]));
  });
}

function decodePayload(value) {
  return typeof value === "string" ? JSON.parse(value) : value ?? null;
}

function createRepository(runSql) {
  const playerId = (code, seat) => `${code}-${seat}`;

  async function findOne(table, column, value) {
    const rows = decodeRows(await runSql(
      `SELECT payload FROM public.${table} WHERE ${column} = ${quote(value)} LIMIT 1`,
    ));
    return decodePayload(rows[0]?.payload);
  }

  async function update(table, column, value, current, patch) {
    if (!current) throw new Error("record_not_found");
    await runSql(
      `UPDATE public.${table} SET payload = ${json({ ...current, ...patch })} `
      + `WHERE ${column} = ${quote(value)}`,
    );
  }

  return {
    async getRoom(code) {
      return findOne("mahjong_rooms", "code", code);
    },
    async insertRoom(room) {
      const result = await runSql(
        `INSERT INTO public.mahjong_rooms (code, payload) VALUES (${quote(room.code)}, ${json(room)}) `
        + "ON CONFLICT DO NOTHING RETURNING code",
      );
      return (result?.AffectedRows ?? 0) > 0 || decodeRows(result).length > 0;
    },
    async updateRoom(code, patch) {
      await update("mahjong_rooms", "code", code, await this.getRoom(code), patch);
    },
    async listPlayers(code) {
      const rows = decodeRows(await runSql(
        `SELECT payload FROM public.mahjong_players WHERE room_code = ${quote(code)}`,
      ));
      return rows.map((row) => decodePayload(row.payload));
    },
    async getPlayer(code, seat) {
      return findOne("mahjong_players", "id", playerId(code, seat));
    },
    async insertPlayer(player) {
      const id = playerId(player.roomCode, player.seat);
      const result = await runSql(
        "INSERT INTO public.mahjong_players (id, room_code, seat, payload) VALUES "
        + `(${quote(id)}, ${quote(player.roomCode)}, ${quote(player.seat)}, ${json(player)}) `
        + "ON CONFLICT DO NOTHING RETURNING id",
      );
      return (result?.AffectedRows ?? 0) > 0 || decodeRows(result).length > 0;
    },
    async updatePlayer(code, seat, patch) {
      const id = playerId(code, seat);
      await update("mahjong_players", "id", id, await this.getPlayer(code, seat), patch);
    },
  };
}

module.exports = { createRepository, decodeRows, quote };
