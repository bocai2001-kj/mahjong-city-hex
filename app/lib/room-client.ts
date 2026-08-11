const functionNames = {
  mahjong_create_room: "create",
  mahjong_get_room: "get",
  mahjong_join_room: "join",
  mahjong_draw_hex: "select",
  mahjong_next_round: "next",
} as const;

const apiUrl = "/mahjong-room";

const errorMessages: Record<string, string> = {
  room_not_found: "没有找到这个房间，请检查房间码",
  seat_taken: "这个方位已经有人了，请选择其他方位",
  already_selected: "本局海克斯已经锁定",
  host_verification_failed: "只有房主可以开始下一局",
  seat_verification_failed: "座位验证失败，请重新进入房间",
  network_error: "网络连接失败，请稍后重试",
};

function requestData(name: keyof typeof functionNames, params: Record<string, unknown>) {
  const action = functionNames[name];
  if (action === "create") return { action, mode: params.p_mode };
  if (action === "get") return { action, code: params.p_code };
  if (action === "join") {
    return { action, code: params.p_code, seat: params.p_seat, token: params.p_token };
  }
  if (action === "select") {
    return {
      action,
      code: params.p_code,
      seat: params.p_seat,
      token: params.p_token,
    };
  }
  return { action, code: params.p_code, hostToken: params.p_host_token };
}

export async function rpc<T>(name: keyof typeof functionNames, params: Record<string, unknown>): Promise<T> {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData(name, params)),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error("network_error");

    const result = await response.json() as { ok?: boolean; data?: T; error?: string };
    if (!result?.ok) throw new Error(result?.error ?? "network_error");
    return result.data as T;
  } catch (error) {
    const code = error instanceof Error ? error.message : "network_error";
    throw new Error(errorMessages[code] ?? "网络连接失败，请稍后重试");
  }
}
