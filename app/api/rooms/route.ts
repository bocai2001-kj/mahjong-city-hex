import { NextResponse } from "next/server";
import { chooseCity, chooseRarity, type Mode } from "../../lib/game-data";
import { getDatabase, getPlayers, getRoom, publicRoom } from "../../lib/rooms";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function roomCode() {
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { mode?: Mode };
  if (body.mode !== "longyan" && body.mode !== "xiamen") {
    return NextResponse.json({ error: "请选择正确的麻将玩法" }, { status: 400 });
  }

  const db = getDatabase();
  const city = chooseCity(body.mode);
  const rarity = chooseRarity();
  const hostToken = crypto.randomUUID();
  let code = "";

  for (let attempt = 0; attempt < 8; attempt += 1) {
    code = roomCode();
    const result = await db
      .prepare("INSERT OR IGNORE INTO rooms (code, mode, city_name, city_effect, city_origin, rarity, round, host_token, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)")
      .bind(code, body.mode, city.name, city.effect, city.origin, rarity, hostToken, new Date().toISOString())
      .run();
    if (result.meta.changes === 1) break;
    code = "";
  }

  if (!code) return NextResponse.json({ error: "房间创建失败，请重试" }, { status: 503 });
  const room = await getRoom(db, code);
  if (!room) return NextResponse.json({ error: "房间创建失败" }, { status: 500 });
  return NextResponse.json({ room: publicRoom(room, []), hostToken });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.toUpperCase() ?? "";
  const db = getDatabase();
  const room = await getRoom(db, code);
  if (!room) return NextResponse.json({ error: "没有找到这个房间" }, { status: 404 });
  return NextResponse.json({ room: publicRoom(room, await getPlayers(db, code)) });
}
