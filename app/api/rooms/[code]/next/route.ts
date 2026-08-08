import { NextResponse } from "next/server";
import { chooseCity, chooseRarity, createCandidates } from "../../../../lib/game-data";
import { getDatabase, getPlayers, getRoom, normalizeCode, type PlayerRow } from "../../../../lib/rooms";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await context.params;
  const code = normalizeCode(rawCode);
  const body = (await request.json().catch(() => ({}))) as { hostToken?: string };
  const db = getDatabase();
  const room = await getRoom(db, code);
  if (!room) return NextResponse.json({ error: "没有找到这个房间" }, { status: 404 });
  if (!body.hostToken || body.hostToken !== room.host_token) {
    return NextResponse.json({ error: "只有创建房间的手机可以开始下一局" }, { status: 403 });
  }

  const city = chooseCity(room.mode);
  const rarity = chooseRarity();
  const players = await getPlayers(db, code);
  const statements = [
    db.prepare("UPDATE rooms SET city_name = ?, city_effect = ?, city_origin = ?, rarity = ?, round = round + 1 WHERE code = ?")
      .bind(city.name, city.effect, city.origin, rarity, code),
    ...players.map((player: PlayerRow) =>
      db.prepare("UPDATE room_players SET candidates = ?, selected_name = NULL, selected_effect = NULL, selected_origin = NULL WHERE room_code = ? AND seat = ?")
        .bind(JSON.stringify(createCandidates(room.mode, rarity)), code, player.seat),
    ),
  ];
  await db.batch(statements);
  return NextResponse.json({ ok: true, round: room.round + 1 });
}
