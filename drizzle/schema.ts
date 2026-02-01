import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, primaryKey, varchar, text, timestamp, int, unique, decimal, mysqlEnum } from "drizzle-orm/mysql-core"
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

export const leagueSchedule = mysqlTable("league_schedule", {
	id: varchar({ length: 21 }).notNull(),
	trackName: varchar("track_name", { length: 50 }).notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	temp: int().notNull(),
	raceLength: int("race_length").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	seasonNumber: int("season_number").notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "league_schedule_id"}),
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
	discord: varchar({ length: 37 }).default('),
	team: varchar({ length: 20 }).default('),
	bio: text().default(sql`('')`),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	iracingId: varchar("iracing_id", { length: 10 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "profile_id"}),
	unique("profile_iracing_id_unique").on(table.iracingId),
	unique("profile_user_id_unique").on(table.userId),
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
	email: varchar({ length: 255 }),
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
