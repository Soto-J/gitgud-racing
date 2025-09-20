import { nanoid } from "nanoid";

import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const leagueScheduleTable = mysqlTable("league_schedule", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$default(() => nanoid()),

  track: varchar("track", { length: 50 }).notNull(),
  date: timestamp("date").notNull(),
  temp: int("temp").notNull(),
  raceLength: int("race_length").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
