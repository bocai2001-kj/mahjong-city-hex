"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import { useCallback, useEffect, useState } from "react";
import type { Effect, Mode, Rarity } from "./lib/game-data";
import { rpc } from "./lib/room-client";

type Seat = "东" | "南" | "西" | "北";

type PublicPlayer = { seat: Seat; selected: Effect | null };
type Room = {
  code: string;
  mode: Mode;
  city: Effect;
  rarity: Rarity;
  round: number;
  players: PublicPlayer[];
};

const seats: Seat[] = ["东", "南", "西", "北"];
const rarityLabels: Record<Rarity, string> = { silver: "银色", gold: "金色", prismatic: "棱彩" };

export default function Home() {
  const [mode, setMode] = useState<Mode>("longyan");
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [hostToken, setHostToken] = useState("");
  const [currentSeat, setCurrentSeat] = useState<Seat | null>(null);
  const [pendingSeat, setPendingSeat] = useState<Seat | null>(null);
  const [seatToken, setSeatToken] = useState("");
  const [candidates, setCandidates] = useState<Effect[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mySelection, setMySelection] = useState<Effect | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadRoom = useCallback(async (code: string, quiet = false) => {
    try {
      const result = await rpc<{ room: Room }>("mahjong_get_room", { p_code: code });
      setRoom(result.room);
      if (!quiet) setMessage("");
      return result.room;
    } catch (error) {
      if (!quiet) setMessage(error instanceof Error ? error.message : "房间加载失败");
      return null;
    }
  }, []);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("room")?.replace(/\D/g, "").slice(0, 6);
    if (code) {
      setJoinCode(code);
      loadRoom(code);
    }
  }, [loadRoom]);

  useEffect(() => {
    if (!room) return;
    const timer = window.setInterval(() => loadRoom(room.code, true), 2200);
    return () => window.clearInterval(timer);
  }, [room?.code, loadRoom]);

  const restoreSeat = useCallback(async (targetRoom: Room, seat: Seat, token: string) => {
    try {
      const result = await rpc<{ candidates: Effect[]; selected: Effect | null }>("mahjong_join_room", {
        p_code: targetRoom.code,
        p_seat: seat,
        p_token: token,
      });
      setCandidates(result.candidates);
      setMySelection(result.selected);
      setSelectedIndex(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "座位恢复失败");
    }
  }, []);

  useEffect(() => {
    if (room && currentSeat && seatToken) restoreSeat(room, currentSeat, seatToken);
  }, [room?.round, currentSeat, seatToken, restoreSeat]);

  const createRoom = async () => {
    setBusy(true);
    setMessage("");
    try {
      const result = await rpc<{ room: Room; hostToken: string }>("mahjong_create_room", {
        p_mode: mode,
      });
      setRoom(result.room);
      setHostToken(result.hostToken);
      localStorage.setItem(`mahjong-host-${result.room.code}`, result.hostToken);
      window.history.replaceState(null, "", `?room=${result.room.code}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建失败");
    } finally {
      setBusy(false);
    }
  };

  const enterRoom = async () => {
    const code = joinCode.trim();
    if (!/^\d{6}$/.test(code)) return setMessage("请输入六位数字房间码");
    setBusy(true);
    const loaded = await loadRoom(code);
    if (loaded) {
      const savedHostToken = localStorage.getItem(`mahjong-host-${code}`) ?? "";
      setHostToken(savedHostToken);
      window.history.replaceState(null, "", `?room=${code}`);
    }
    setBusy(false);
  };

  const chooseSeat = async (seat: Seat) => {
    setBusy(true);
    setMessage("");
    const token = localStorage.getItem(`mahjong-seat-${room?.code}-${seat}`) ?? crypto.randomUUID();
    try {
      const result = await rpc<{ candidates: Effect[]; selected: Effect | null }>("mahjong_join_room", {
        p_code: room?.code,
        p_seat: seat,
        p_token: token,
      });
      localStorage.setItem(`mahjong-seat-${room?.code}-${seat}`, token);
      setCurrentSeat(seat);
      setPendingSeat(null);
      setSeatToken(token);
      setCandidates(result.candidates);
      setMySelection(result.selected);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "座位选择失败");
    } finally {
      setBusy(false);
    }
  };

  const lockChoice = async () => {
    if (!room || !currentSeat || selectedIndex === null) return;
    setBusy(true);
    try {
      const result = await rpc<{ selected: Effect }>("mahjong_select_hex", {
        p_code: room.code,
        p_seat: currentSeat,
        p_token: seatToken,
        p_choice_index: selectedIndex,
      });
      setMySelection(result.selected);
      await loadRoom(room.code, true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "锁定失败");
    } finally {
      setBusy(false);
    }
  };

  const shareRoom = async () => {
    if (!room) return;
    const text = `加入麻将城邦房间 ${room.code}`;
    const url = `${window.location.origin}?room=${room.code}`;
    if (navigator.share) {
      await navigator.share({ title: "麻将城邦与海克斯", text, url }).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setMessage("房间链接已复制");
    }
  };

  const nextRound = async () => {
    if (!room || !hostToken) return;
    setBusy(true);
    try {
      await rpc("mahjong_next_round", {
        p_code: room.code,
        p_host_token: hostToken,
      });
      setMySelection(null);
      setCandidates([]);
      setSelectedIndex(null);
      await loadRoom(room.code, true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "下一局开启失败");
    } finally {
      setBusy(false);
    }
  };

  const exitRoom = () => {
    setRoom(null);
    setCurrentSeat(null);
    setPendingSeat(null);
    setSeatToken("");
    setCandidates([]);
    setMySelection(null);
    setMessage("");
    window.history.replaceState(null, "", "/");
  };

  const completed = room?.players.filter((player) => player.selected).length ?? 0;

  if (!room) {
    return (
      <main className="app-shell">
        <header className="topbar"><strong>城邦与海克斯</strong><span>联机版</span></header>
        <section className="screen welcome">
          <p className="eyebrow">四人同局 · 各自抽取</p>
          <h1>一桌四机，<br />各选其道</h1>
          <p className="lead">创建房间后，把六位数字房间码发给牌友。每个人只需选择自己的东南西北座位。</p>
          <div className="wind-row" aria-hidden="true">{seats.map((seat) => <span key={seat}>{seat}</span>)}</div>

          <section className="panel">
            <p className="section-label">创建新房间</p>
            <div className="mode-grid">
              <button className={mode === "longyan" ? "mode-card selected" : "mode-card"} onClick={() => setMode("longyan")}>
                <strong>龙岩麻将</strong><small>半自摸 · 分饼 · 十三幺</small>
              </button>
              <button className={mode === "xiamen" ? "mode-card selected" : "mode-card"} onClick={() => setMode("xiamen")}>
                <strong>厦门麻将</strong><small>跟打 · 有金不能平胡</small>
              </button>
            </div>
            <button className="primary" onClick={createRoom} disabled={busy}>{busy ? "正在创建…" : "创建房间"}</button>
          </section>

          <div className="divider"><span>或</span></div>
          <section className="panel compact">
            <label className="section-label" htmlFor="roomCode">加入已有房间</label>
            <div className="join-row">
              <input id="roomCode" value={joinCode} onChange={(event) => setJoinCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="输入六位数字" maxLength={6} inputMode="numeric" pattern="[0-9]*" autoComplete="one-time-code" />
              <button onClick={enterRoom} disabled={busy}>加入</button>
            </div>
          </section>
          {message && <p className="notice" role="status">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="text-button" onClick={exitRoom}>退出</button>
        <strong>第 {room.round} 局</strong>
        <button className="text-button" onClick={shareRoom}>邀请</button>
      </header>
      <section className="screen room-screen">
        <div className="room-heading">
          <div><p className="eyebrow">房间码</p><button className="room-code" onClick={shareRoom}>{room.code}</button></div>
          <div className="sync-dot"><i />实时同步</div>
        </div>

        <article className="city-card">
          <div className="card-meta"><span>{room.city.origin}</span><span>{rarityLabels[room.rarity]}海克斯局</span></div>
          <h2>{room.city.name}</h2>
          <p>{room.city.effect}</p>
        </article>

        <div className="section-heading"><div><p className="eyebrow">选择方位</p><h2>{currentSeat ? `你是${currentSeat}家` : "你坐哪一方？"}</h2></div><span>{completed} / 4 已锁定</span></div>
        <div className="seat-grid">
          {seats.map((seat) => {
            const player = room.players.find((item) => item.seat === seat);
            const mine = currentSeat === seat;
            return (
              <button key={seat} className={`seat-card ${player ? "occupied" : ""} ${mine ? "mine" : ""} ${pendingSeat === seat ? "pending" : ""}`} onClick={() => !currentSeat && setPendingSeat(seat)} disabled={busy || (!!player && !mine)}>
                <span>{seat}</span>
                <strong>{mine ? "我的座位" : player?.selected ? "已锁定" : player ? "选择中" : "空位"}</strong>
                {player?.selected && <small>{player.selected.name}</small>}
              </button>
            );
          })}
        </div>
        {!currentSeat && pendingSeat && <button className="primary" onClick={() => chooseSeat(pendingSeat)} disabled={busy}>{busy ? "正在占座…" : `确认选择${pendingSeat}家`}</button>}

        {currentSeat && !mySelection && candidates.length > 0 && (
          <section className="choice-section">
            <p className="eyebrow">仅显示在你的手机</p>
            <h2>选择一个海克斯</h2>
            <p className="lead small">三选一，锁定后本局不能更换。</p>
            <div className="choice-list">
              {candidates.map((candidate, index) => (
                <button key={candidate.name} className={selectedIndex === index ? "choice-card selected" : "choice-card"} onClick={() => setSelectedIndex(index)}>
                  <span className="choice-number">{index + 1}</span>
                  <span><strong>{candidate.name}</strong><small>{candidate.effect}</small><em>{candidate.origin}</em></span>
                </button>
              ))}
            </div>
            <button className="primary" onClick={lockChoice} disabled={selectedIndex === null || busy}>{busy ? "正在锁定…" : "锁定这个海克斯"}</button>
          </section>
        )}

        {mySelection && (
          <section className="locked-card">
            <p className="eyebrow">你的本局海克斯</p>
            <h2>{mySelection.name}</h2>
            <p>{mySelection.effect}</p>
            <span>等待其他玩家 · {completed}/4</span>
          </section>
        )}

        {completed === 4 && (
          <section className="summary">
            <p className="eyebrow">本局配置完成</p>
            <h2>可以开牌了</h2>
            <div className="summary-list">
              {seats.map((seat) => {
                const player = room.players.find((item) => item.seat === seat);
                return <article key={seat}><span>{seat}</span><div><strong>{player?.selected?.name}</strong><p>{player?.selected?.effect}</p></div></article>;
              })}
            </div>
            {hostToken && <button className="primary" onClick={nextRound} disabled={busy}>{busy ? "正在开启…" : "本局结束 · 开始下一局"}</button>}
          </section>
        )}
        {message && <p className="notice" role="status">{message}</p>}
      </section>
    </main>
  );
}
