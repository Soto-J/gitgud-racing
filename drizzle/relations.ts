import { relations } from "drizzle-orm/relations";
import { user, account, iracingAuth, license, profile, series, seriesWeeklyStats, session, userChartData } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	iracingAuths: many(iracingAuth),
	licenses: many(license),
	profiles: many(profile),
	sessions: many(session),
	userChartData: many(userChartData),
}));

export const iracingAuthRelations = relations(iracingAuth, ({one}) => ({
	user: one(user, {
		fields: [iracingAuth.userId],
		references: [user.id]
	}),
}));

export const licenseRelations = relations(license, ({one}) => ({
	user: one(user, {
		fields: [license.userId],
		references: [user.id]
	}),
}));

export const profileRelations = relations(profile, ({one}) => ({
	user: one(user, {
		fields: [profile.userId],
		references: [user.id]
	}),
}));

export const seriesWeeklyStatsRelations = relations(seriesWeeklyStats, ({one}) => ({
	series: one(series, {
		fields: [seriesWeeklyStats.seriesId],
		references: [series.seriesId]
	}),
}));

export const seriesRelations = relations(series, ({many}) => ({
	seriesWeeklyStats: many(seriesWeeklyStats),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userChartDataRelations = relations(userChartData, ({one}) => ({
	user: one(user, {
		fields: [userChartData.userId],
		references: [user.id]
	}),
}));