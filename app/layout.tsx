import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "mahjong-city-hex.still-chub-6036.chatgpt.site";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;
  return {
    metadataBase: new URL(origin),
    title: "麻将城邦与海克斯 · 四人联机版",
    description: "创建牌桌房间，四名玩家分别用手机选择座位并抽取本局海克斯。",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "麻将城邦与海克斯 · 四人联机版",
      description: "输入房间码，选择东南西北，各自在手机上抽取本局海克斯。",
      images: [{ url: `${origin}/og.png`, width: 1536, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "麻将城邦与海克斯 · 四人联机版",
      description: "输入房间码，选择东南西北，各自在手机上抽取本局海克斯。",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
