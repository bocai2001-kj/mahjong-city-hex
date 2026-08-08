import { NextResponse } from "next/server";
import { getDatabase, isSeat, normalizeCode, parseCandidates, type PlayerRow } from "../../../../lib/rooms";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await context.params;
  const code = normalizeCode(rawCode);
  const body = (await request.json().catch(() => ({}))) as { seat?: string; token?: string; choiceIndex?: number };
  if (!isSeat(body.seat) || !body.token || !Number.isInteger(body.choiceIndex)) {
    return NextResponse.json({ error: "选择信息不完整" }, { status: 400 });
  }

  const db = getDatabase();
  const player = await db
    .prepare("SELECT * FROM room_players WHERE room_code = ? AND seat = ?")
    .bind(code, body.seat)
    .first<PlayerRow>();
  if (!player || player.seat_token !== body.token) {
    return NextResponse.json({ error: "座位验证失败，请重新进入房间" }, { status: 403 });
  }
  if (player.selected_name) {
    return NextResponse.json({ error: "本局已经锁定海克斯" }, { status: 409 });
  }

  const candidates = parseCandidates(player.candidates);
  const choice = candidates[body.choiceIndex as number];
  if (!choice) return NextResponse.json({ error: "请选择有效的海克斯" }, { status: 400 });

  await db
    .prepare("UPDATE room_players SET selected_name = ?, selected_effect = ?, selected_origin = ? WHERE room_code = ? AND seat = ? AND seat_token = ?")
    .bind(choice.name, choice.effect, choice.origin, code, body.seat, body.token)
    .run();
  return NextResponse.json({ selected: choice });
}
