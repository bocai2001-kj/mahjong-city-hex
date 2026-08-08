import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rooms = sqliteTable("rooms", {
  code: text("code").primaryKey(),
  mode: text("mode").notNull(),
  cityName: text("city_name").notNull(),
  cityEffect: text("city_effect").notNull(),
  cityOrigin: text("city_origin").notNull(),
  rarity: text("rarity").notNull(),
  round: integer("round").notNull().default(1),
  hostToken: text("host_token").notNull(),
  createdAt: text("created_at").notNull(),
});

export const roomPlayers = sqliteTable(
  "room_players",
  {
    roomCode: text("room_code")
      .notNull()
      .references(() => rooms.code, { onDelete: "cascade" }),
    seat: text("seat").notNull(),
    seatToken: text("seat_token").notNull(),
    candidates: text("candidates").notNull(),
    selectedName: text("selected_name"),
    selectedEffect: text("selected_effect"),
    selectedOrigin: text("selected_origin"),
    joinedAt: text("joined_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.roomCode, table.seat] })],
);
