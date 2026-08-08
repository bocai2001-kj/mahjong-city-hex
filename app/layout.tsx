import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "麻将城邦与海克斯抽取器",
  description: "为龙岩麻将与厦门麻将随机抽取每局城邦和个人海克斯。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
