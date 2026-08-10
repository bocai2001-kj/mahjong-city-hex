const SUPABASE_URL = "https://rituppigluaahmohrjhg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_HKlLYXGmO_4LQRRrOv0KnQ_cHh2Rdul";

const errorMessages: Record<string, string> = {
  room_not_found: "没有找到这个房间，请检查房间码",
  seat_taken: "这个方位已经有人了，请选择其他方位",
  already_selected: "本局海克斯已经锁定",
  host_verification_failed: "只有房主可以开始下一局",
  seat_verification_failed: "座位验证失败，请重新进入房间",
  invalid_choice: "请选择一个有效的海克斯",
};

export async function rpc<T>(name: string, params: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
    cache: "no-store",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    const code = Object.keys(errorMessages).find((key) => data.message?.includes(key));
    throw new Error(code ? errorMessages[code] : "网络连接失败，请稍后重试");
  }

  return response.json() as Promise<T>;
}
