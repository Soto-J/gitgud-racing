import { nanoid } from "nanoid";

import {
  mysqlTable,
  varchar,
  timestamp,
  int,
  date,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

import { user } from "@/db/schemas/auth";

export const userChartDataTable = mysqlTable(
  "user_chart_data",
  {
    id: varchar("id", { length: 21 })
      .primaryKey()
      .$default(() => nanoid()),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    categoryId: int("category_id").notNull(),
    category: varchar("category", { length: 50 }).notNull(),

    chartTypeId: int("chart_type_id").notNull(),
    chartType: varchar("chart_type", { length: 30 }).notNull(),

    when: date("when").notNull(),
    value: int("value").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    // Prevent duplicate entries for same user, category, chart type, and date
    uniqueIndex("uniqueUserChartData").on(
      table.userId,
      table.category,
      table.chartType,
      table.when,
    ),
  ],
);
