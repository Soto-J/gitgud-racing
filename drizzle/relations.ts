import { relations } from "drizzle-orm/relations";
import { user, account, license, profile, session } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	licenses: many(license),
	profiles: many(profile),
	sessions: many(session),
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

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));