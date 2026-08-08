import { NextResponse } from "next/server";
import { createCandidates } from "../../../../lib/game-data";
import { getDatabase, getRoom, isSeat, normalizeCode, parseCandidates, type PlayerRow } from "../../../../lib/rooms";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await context.params;
  const code = normalizeCode(rawCode);
  const body = (await request.json().catch(() => ({}))) as { seat?: string; token?: string };
  if (!isSeat(body.seat) || !body.token) {
    return NextResponse.json({ error: "请选择座位" }, { status: 400 });
  }

  const db = getDatabase();
  const room = await getRoom(db, code);
  if (!room) return NextResponse.json({ error: "没有找到这个房间" }, { status: 404 });
  const candidates = createCandidates(room.mode, room.rarity);

  await db
    .prepare("INSERT OR IGNORE INTO room_players (room_code, seat, seat_token, candidates, joined_at) VALUES (?, ?, ?, ?, ?)")
    .bind(code, body.seat, body.token, JSON.stringify(candidates), new Date().toISOString())
    .run();

  const player = await db
    .prepare("SELECT * FROM room_players WHERE room_code = ? AND seat = ?")
    .bind(code, body.seat)
    .first<PlayerRow>();
  if (!player || player.seat_token !== body.token) {
    return NextResponse.json({ error: "这个座位已经被其他玩家选择" }, { status: 409 });
  }

  return NextResponse.json({
    seat: player.seat,
    candidates: parseCandidates(player.candidates),
    selected: player.selected_name
      ? { name: player.selected_name, effect: player.selected_effect, origin: player.selected_origin }
      : null,
    round: room.round,
  });
}
