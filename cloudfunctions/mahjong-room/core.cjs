"use strict";

const { randomUUID } = require("node:crypto");
const { chooseCity, chooseRarity, drawHex } = require("./effects.cjs");

const seats = ["东", "南", "西", "北"];
const modes = ["longyan", "xiamen"];

function fail(code) {
  throw new Error(code);
}

function publicRoom(room, players) {
  return {
    code: room.code,
    mode: room.mode,
    city: room.city,
    rarity: room.rarity,
    round: room.round,
    players: players
      .sort((a, b) => seats.indexOf(a.seat) - seats.indexOf(b.seat))
      .map(({ seat, selected }) => ({ seat, selected: selected ?? null })),
  };
}

async function createRoom(repository, { mode }) {
  if (!modes.includes(mode)) fail("invalid_mode");
  const rarity = chooseRarity();
  const hostToken = randomUUID();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
    const room = {
      code,
      mode,
      city: chooseCity(mode),
      rarity,
      round: 1,
      hostToken,
      createdAt: new Date().toISOString(),
    };
    if (await repository.insertRoom(room)) {
      return { room: publicRoom(room, []), hostToken };
    }
  }
  fail("room_creation_failed");
}

async function getRoom(repository, { code }) {
  const room = await repository.getRoom(code);
  if (!room) fail("room_not_found");
  return { room: publicRoom(room, await repository.listPlayers(code)) };
}

async function joinRoom(repository, { code, seat, token }) {
  if (!seats.includes(seat)) fail("invalid_seat");
  const room = await repository.getRoom(code);
  if (!room) fail("room_not_found");

  let player = await repository.getPlayer(code, seat);
  if (!player) {
    const newPlayer = {
      roomCode: code,
      seat,
      seatToken: token,
      selected: null,
      round: room.round,
    };
    const inserted = await repository.insertPlayer(newPlayer);
    player = inserted ? newPlayer : await repository.getPlayer(code, seat);
  }
  if (!player || player.seatToken !== token) fail("seat_taken");

  return {
    seat: player.seat,
    selected: player.selected ?? null,
    round: room.round,
  };
}

async function selectHex(repository, { code, seat, token }, random = Math.random) {
  const player = await repository.getPlayer(code, seat);
  if (!player || player.seatToken !== token) fail("seat_verification_failed");
  if (player.selected) fail("already_selected");
  const room = await repository.getRoom(code);
  if (!room) fail("room_not_found");
  const selected = drawHex(room.mode, room.rarity, random);
  await repository.updatePlayer(code, seat, { selected });
  return { selected };
}

async function nextRound(repository, { code, hostToken }) {
  const room = await repository.getRoom(code);
  if (!room) fail("room_not_found");
  if (room.hostToken !== hostToken) fail("host_verification_failed");

  const rarity = chooseRarity();
  const round = room.round + 1;
  await repository.updateRoom(code, {
    city: chooseCity(room.mode),
    rarity,
    round,
  });
  const players = await repository.listPlayers(code);
  await Promise.all(players.map((player) => repository.updatePlayer(code, player.seat, {
    selected: null,
    round,
  })));
  return { ok: true, round };
}

module.exports = { createRoom, getRoom, joinRoom, selectHex, nextRound };
