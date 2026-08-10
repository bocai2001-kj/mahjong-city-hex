import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "麻将城邦与海克斯 · 四人联机版",
  description: "创建牌桌房间，四名玩家分别用手机选择座位并抽取本局海克斯。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

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
