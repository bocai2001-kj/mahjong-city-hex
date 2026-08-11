# 麻将城邦与海克斯

适配龙岩麻将和厦门麻将的四人联机抽取工具。房主创建六位数字房间，四名玩家分别选择东、南、西、北座位，并在自己的手机上随机抽取一次本局海克斯。

## 国内体验地址

https://lyw599-d2gxronq4dd537da0-1466315638.tcloudbaseapp.com

该版本的网页、HTTP 接口、云函数和 PostgreSQL 数据库均部署在腾讯云 CloudBase 上海区域，不依赖 Vercel 或 Supabase。

## 技术结构

- Next.js 静态网页，由 CloudBase 静态托管
- 同域 `/mahjong-room` HTTP 路由转发到 CloudBase 云函数
- CloudBase PostgreSQL 保存房间、座位和选择结果
- 浏览器不能直接读写数据库；座位令牌和房主令牌在云函数内校验
- HTTP 路由设置了总 QPS 和单 IP QPS 限制

## 本地运行

需要 Node.js 22.13 或更新版本。

```bash
npm install
npm run dev
```

检查与构建：

```bash
npm test
npm run typecheck
npm run build
```

CloudBase 数据库结构位于 `cloudfunctions/mahjong-room/schema.sql`，云函数配置位于 `cloudbaserc.json`。
