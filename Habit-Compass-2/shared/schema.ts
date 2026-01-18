import { sql, relations } from "drizzle-orm";
import { index, jsonb, pgTable, serial, text, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  inviteCode: varchar("invite_code", { length: 32 }).unique().notNull(),
  createdById: varchar("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  role: varchar("role", { length: 20 }).default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const groupHabits = pgTable("group_habits", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).default("other").notNull(),
  weeklyGoal: integer("weekly_goal").default(7).notNull(),
  daysOfWeek: integer("days_of_week").array().default(sql`ARRAY[0, 1, 2, 3, 4, 5, 6]`).notNull(),
  createdById: varchar("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const groupHabitCompletions = pgTable("group_habit_completions", {
  id: serial("id").primaryKey(),
  groupHabitId: integer("group_habit_id").notNull().references(() => groupHabits.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
});

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  habits: many(groupHabits),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
}));

export const groupHabitsRelations = relations(groupHabits, ({ one, many }) => ({
  group: one(groups, {
    fields: [groupHabits.groupId],
    references: [groups.id],
  }),
  completions: many(groupHabitCompletions),
}));

export const groupHabitCompletionsRelations = relations(groupHabitCompletions, ({ one }) => ({
  habit: one(groupHabits, {
    fields: [groupHabitCompletions.groupHabitId],
    references: [groupHabits.id],
  }),
}));

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  inviteCode: true,
  createdById: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertGroupHabitSchema = createInsertSchema(groupHabits).omit({
  id: true,
  createdAt: true,
  createdById: true,
});

export const insertGroupHabitCompletionSchema = createInsertSchema(groupHabitCompletions).omit({
  id: true,
  completedAt: true,
});

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupHabit = z.infer<typeof insertGroupHabitSchema>;
export type GroupHabit = typeof groupHabits.$inferSelect;
export type InsertGroupHabitCompletion = z.infer<typeof insertGroupHabitCompletionSchema>;
export type GroupHabitCompletion = typeof groupHabitCompletions.$inferSelect;
