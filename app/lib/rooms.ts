import { env } from "cloudflare:workers";
import type { Effect, Mode, Rarity } from "./game-data";

export const seats = ["东", "南", "西", "北"] as const;
export type Seat = (typeof seats)[number];

export type RoomRow = {
  code: string;
  mode: Mode;
  city_name: string;
  city_effect: string;
  city_origin: string;
  rarity: Rarity;
  round: number;
  host_token: string;
  created_at: string;
};

export type PlayerRow = {
  room_code: string;
  seat: Seat;
  seat_token: string;
  candidates: string;
  selected_name: string | null;
  selected_effect: string | null;
  selected_origin: string | null;
  joined_at: string;
};

export function getDatabase(): D1Database {
  if (!env.DB) throw new Error("联机数据库暂不可用");
  return env.DB;
}

export async function getRoom(db: D1Database, code: string) {
  return db.prepare("SELECT * FROM rooms WHERE code = ?").bind(code).first<RoomRow>();
}

export async function getPlayers(db: D1Database, code: string) {
  const result = await db
    .prepare("SELECT * FROM room_players WHERE room_code = ? ORDER BY CASE seat WHEN '东' THEN 1 WHEN '南' THEN 2 WHEN '西' THEN 3 ELSE 4 END")
    .bind(code)
    .all<PlayerRow>();
  return result.results;
}

export function publicRoom(room: RoomRow, players: PlayerRow[]) {
  return {
    code: room.code,
    mode: room.mode,
    city: {
      name: room.city_name,
      effect: room.city_effect,
      origin: room.city_origin,
    },
    rarity: room.rarity,
    round: room.round,
    players: players.map((player) => ({
      seat: player.seat,
      selected: player.selected_name
        ? {
            name: player.selected_name,
            effect: player.selected_effect,
            origin: player.selected_origin,
          }
        : null,
    })),
  };
}

export function parseCandidates(value: string): Effect[] {
  return JSON.parse(value) as Effect[];
}

export function normalizeCode(value: unknown): string {
  return String(value ?? "").trim().replace(/\D/g, "").slice(0, 6);
}

export function isSeat(value: unknown): value is Seat {
  return seats.includes(value as Seat);
}
