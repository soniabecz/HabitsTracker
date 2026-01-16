import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  groups,
  groupMembers,
  groupHabits,
  groupHabitCompletions,
  users,
  type Group,
  type GroupMember,
  type GroupHabit,
  type GroupHabitCompletion,
  type User,
} from "../shared/schema";

export interface IStorage {
  getGroupsForUser(userId: string): Promise<Group[]>;
  getGroup(groupId: number): Promise<Group | undefined>;
  getGroupByInviteCode(inviteCode: string): Promise<Group | undefined>;
  createGroup(group: Omit<Group, "id" | "createdAt">): Promise<Group>;
  
  getGroupMembers(groupId: number): Promise<(GroupMember & { user?: User })[]>;
  addGroupMember(member: Omit<GroupMember, "id" | "joinedAt">): Promise<GroupMember>;
  removeGroupMember(groupId: number, userId: string): Promise<void>;
  isGroupMember(groupId: number, userId: string): Promise<boolean>;
  
  getGroupHabits(groupId: number): Promise<GroupHabit[]>;
  getGroupHabit(habitId: number): Promise<GroupHabit | undefined>;
  createGroupHabit(habit: Omit<GroupHabit, "id" | "createdAt">): Promise<GroupHabit>;
  deleteGroupHabit(habitId: number): Promise<void>;
  
  getGroupCompletions(groupId: number): Promise<GroupHabitCompletion[]>;
  toggleGroupHabitCompletion(habitId: number, userId: string, date: string): Promise<GroupHabitCompletion | null>;
}

class DatabaseStorage implements IStorage {
  async getGroupsForUser(userId: string): Promise<Group[]> {
    const memberships = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));
    
    if (memberships.length === 0) return [];
    
    const groupIds = memberships.map(m => m.groupId);
    const result: Group[] = [];
    
    for (const id of groupIds) {
      const [group] = await db.select().from(groups).where(eq(groups.id, id));
      if (group) result.push(group);
    }
    
    return result;
  }

  async getGroup(groupId: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, groupId));
    return group;
  }

  async getGroupByInviteCode(inviteCode: string): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.inviteCode, inviteCode));
    return group;
  }

  async createGroup(group: Omit<Group, "id" | "createdAt">): Promise<Group> {
    const [created] = await db.insert(groups).values(group).returning();
    return created;
  }

  async getGroupMembers(groupId: number): Promise<(GroupMember & { user?: User })[]> {
    const members = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));
    
    const result: (GroupMember & { user?: User })[] = [];
    
    for (const member of members) {
      const [user] = await db.select().from(users).where(eq(users.id, member.userId));
      result.push({ ...member, user: user || undefined });
    }
    
    return result;
  }

  async addGroupMember(member: Omit<GroupMember, "id" | "joinedAt">): Promise<GroupMember> {
    const [created] = await db.insert(groupMembers).values(member).returning();
    return created;
  }

  async removeGroupMember(groupId: number, userId: string): Promise<void> {
    await db
      .delete(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
  }

  async isGroupMember(groupId: number, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
    return !!member;
  }

  async getGroupHabits(groupId: number): Promise<GroupHabit[]> {
    return await db.select().from(groupHabits).where(eq(groupHabits.groupId, groupId));
  }

  async getGroupHabit(habitId: number): Promise<GroupHabit | undefined> {
    const [habit] = await db.select().from(groupHabits).where(eq(groupHabits.id, habitId));
    return habit;
  }

  async createGroupHabit(habit: Omit<GroupHabit, "id" | "createdAt">): Promise<GroupHabit> {
    const [created] = await db.insert(groupHabits).values(habit).returning();
    return created;
  }

  async deleteGroupHabit(habitId: number): Promise<void> {
    await db.delete(groupHabits).where(eq(groupHabits.id, habitId));
  }

  async getGroupCompletions(groupId: number): Promise<GroupHabitCompletion[]> {
    const habits = await this.getGroupHabits(groupId);
    const habitIds = habits.map(h => h.id);
    
    if (habitIds.length === 0) return [];
    
    const result: GroupHabitCompletion[] = [];
    for (const id of habitIds) {
      const completions = await db
        .select()
        .from(groupHabitCompletions)
        .where(eq(groupHabitCompletions.groupHabitId, id));
      result.push(...completions);
    }
    
    return result;
  }

  async toggleGroupHabitCompletion(habitId: number, userId: string, date: string): Promise<GroupHabitCompletion | null> {
    const [existing] = await db
      .select()
      .from(groupHabitCompletions)
      .where(
        and(
          eq(groupHabitCompletions.groupHabitId, habitId),
          eq(groupHabitCompletions.userId, userId),
          eq(groupHabitCompletions.date, date)
        )
      );

    if (existing) {
      if (existing.completed) {
        await db
          .update(groupHabitCompletions)
          .set({ completed: false, completedAt: null })
          .where(eq(groupHabitCompletions.id, existing.id));
        return { ...existing, completed: false, completedAt: null };
      } else {
        await db
          .update(groupHabitCompletions)
          .set({ completed: true, completedAt: new Date() })
          .where(eq(groupHabitCompletions.id, existing.id));
        return { ...existing, completed: true, completedAt: new Date() };
      }
    } else {
      const [created] = await db
        .insert(groupHabitCompletions)
        .values({
          groupHabitId: habitId,
          userId: userId,
          date: date,
          completed: true,
          completedAt: new Date(),
        })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
