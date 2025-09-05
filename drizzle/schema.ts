import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, primaryKey, varchar, text, timestamp, unique, int, decimal, mysqlEnum, date, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const account = mysqlTable("account", {
	id: varchar({ length: 36 }).notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	scope: text(),
	password: text(),
	idToken: text("id_token"),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "account_id"}),
]);

export const iracingAuth = mysqlTable("iracing_auth", {
	id: varchar({ length: 21 }).notNull(),
	authCode: text("auth_code").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id),
},
(table) => [
	primaryKey({ columns: [table.id], name: "iracing_auth_id"}),
	unique("iracing_auth_user_id_unique").on(table.userId),
]);

export const license = mysqlTable("license", {
	id: varchar({ length: 21 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	sportsCarIRating: int("sports_car_i_rating").notNull(),
	sportsCarSafetyRating: decimal("sports_car_safety_rating", { precision: 4, scale: 2 }).notNull(),
	sportsLicenseClass: mysqlEnum("sports_license_class", ['A','B','C','D','R']).default('R').notNull(),
	ovalIRating: int("oval_i_rating").notNull(),
	ovalSafetyRating: decimal("oval_safety_rating", { precision: 4, scale: 2 }).notNull(),
	ovalLicenseClass: mysqlEnum("oval_license_class", ['A','B','C','D','R']).default('R').notNull(),
	dirtRoadIRating: int("dirt_road_i_rating").default(0).notNull(),
	dirtRoadSafetyRating: decimal("dirt_road_safety_rating", { precision: 4, scale: 2 }).notNull(),
	dirtRoadLicenseClass: mysqlEnum("dirt_road_license_class", ['A','B','C','D','R']).default('R').notNull(),
	dirtOvalIRating: int("dirt_oval_i_rating").default(0).notNull(),
	dirtOvalSafetyRating: decimal("dirt_oval_safety_rating", { precision: 4, scale: 2 }).notNull(),
	dirtOvalLicenseClass: mysqlEnum("dirt_oval_license_class", ['A','B','C','D','R']).default('R').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	formulaCarIRating: int("formula_car_i_rating").notNull(),
	formulaCarSafetyRating: decimal("formula_car_safety_rating", { precision: 4, scale: 2 }).notNull(),
	formulaLicenseClass: mysqlEnum("formula_license_class", ['A','B','C','D','R']).default('R').notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "license_id"}),
	unique("license_user_id_unique").on(table.userId),
]);

export const profile = mysqlTable("profile", {
	id: varchar({ length: 21 }).notNull(),
	isActive: tinyint("is_active").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	discord: varchar({ length: 37 }).default(''),
	team: varchar({ length: 20 }).default(''),
	bio: text().default(sql`('')`),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	iracingId: varchar("iracing_id", { length: 10 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "profile_id"}),
	unique("profile_iracing_id_unique").on(table.iracingId),
	unique("profile_user_id_unique").on(table.userId),
]);

export const series = mysqlTable("series", {
	seriesId: int("series_id").notNull(),
	category: varchar({ length: 25 }).notNull(),
	seriesName: varchar("series_name", { length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.seriesId], name: "series_series_id"}),
]);

export const seriesWeeklyStats = mysqlTable("series_weekly_stats", {
	id: varchar({ length: 21 }).notNull(),
	seriesId: int("series_id").references(() => series.seriesId, { onDelete: "cascade" } ),
	seasonId: int("season_id").notNull(),
	sessionId: int("session_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	seasonYear: int("season_year").notNull(),
	seasonQuarter: int("season_quarter").notNull(),
	raceWeek: int("race_week").notNull(),
	trackName: varchar("track_name", { length: 100 }).notNull(),
	startTime: varchar("start_time", { length: 30 }).notNull(),
	totalSplits: int("total_splits").notNull(),
	totalDrivers: int("total_drivers").notNull(),
	strengthOfField: int("strength_of_field").notNull(),
	averageEntrants: decimal("average_entrants", { precision: 5, scale: 2 }).notNull(),
	averageSplits: decimal("average_splits", { precision: 5, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "series_weekly_stats_id"}),
	unique("series_weekly_stats_session_id_unique").on(table.sessionId),
]);

export const session = mysqlTable("session", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	token: varchar({ length: 255 }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	impersonatedBy: text("impersonated_by"),
},
(table) => [
	primaryKey({ columns: [table.id], name: "session_id"}),
	unique("session_token_unique").on(table.token),
]);

export const user = mysqlTable("user", {
	id: varchar({ length: 36 }).notNull(),
	name: text().notNull(),
	email: varchar({ length: 255 }).notNull(),
	emailVerified: tinyint("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	role: mysqlEnum(['admin','staff','user','guest']).default('user').notNull(),
	banned: tinyint(),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires", { mode: 'string' }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "user_id"}),
	unique("user_email_unique").on(table.email),
]);

export const userChartData = mysqlTable("user_chart_data", {
	id: varchar({ length: 21 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	categoryId: int("category_id").notNull(),
	category: varchar({ length: 50 }).notNull(),
	chartType: varchar("chart_type", { length: 30 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	when: date({ mode: 'string' }).notNull(),
	value: int().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	chartTypeId: int("chart_type_id").notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "user_chart_data_id"}),
	unique("user_chart_data_user_id_category_chart_type_when_unique").on(table.userId, table.category, table.chartType, table.when),
]);

export const verification = mysqlTable("verification", {
	id: varchar({ length: 36 }).notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "verification_id"}),
]);
