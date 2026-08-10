# 麻将城邦与海克斯

适配龙岩麻将和厦门麻将的四人联机抽取工具。房主创建六位数字房间，四名玩家分别选择东、南、西、北座位，并在自己的手机上三选一锁定本局海克斯。

## 在线体验

https://mahjong-city-hex.vercel.app

## 技术结构

- Next.js 静态网页
- Vercel 托管
- Supabase PostgreSQL 保存房间、座位和选择结果
- 浏览器直接调用受限的 Supabase RPC；数据库表已启用 RLS，不开放直接读写

## 本地运行

需要 Node.js 22 或更新版本。

```bash
npm install
npm run dev
```

正式构建：

```bash
npm run build
```

数据库结构位于 `supabase/migrations/`。
