import type { Express } from "express";
import type { Server } from "http";
import { isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { insertGroupSchema, insertGroupHabitSchema } from "../shared/schema";
import crypto from "crypto";

function generateInviteCode(): string {
  return crypto.randomBytes(8).toString("hex");
}

export async function registerRoutes(httpServer: Server, app: Express) {
  app.get("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getGroupsForUser(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertGroupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid group data" });
      }
      
      const group = await storage.createGroup({
        ...parsed.data,
        createdById: userId,
        inviteCode: generateInviteCode(),
      });
      
      await storage.addGroupMember({
        groupId: group.id,
        userId: userId,
        role: "admin",
      });
      
      res.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.get("/api/groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = parseInt(req.params.id);
      
      const isMember = await storage.isGroupMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this group" });
      }
      
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      const members = await storage.getGroupMembers(groupId);
      const habits = await storage.getGroupHabits(groupId);
      
      res.json({ ...group, members, habits });
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.post("/api/groups/join", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { inviteCode } = req.body;
      
      const group = await storage.getGroupByInviteCode(inviteCode);
      if (!group) {
        return res.status(404).json({ message: "Invalid invite code" });
      }
      
      const isMember = await storage.isGroupMember(group.id, userId);
      if (isMember) {
        return res.status(400).json({ message: "Already a member" });
      }
      
      await storage.addGroupMember({
        groupId: group.id,
        userId: userId,
        role: "member",
      });
      
      res.json(group);
    } catch (error) {
      console.error("Error joining group:", error);
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  app.delete("/api/groups/:id/leave", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = parseInt(req.params.id);
      
      await storage.removeGroupMember(groupId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving group:", error);
      res.status(500).json({ message: "Failed to leave group" });
    }
  });

  app.post("/api/groups/:id/habits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = parseInt(req.params.id);
      
      const isMember = await storage.isGroupMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this group" });
      }
      
      const parsed = insertGroupHabitSchema.safeParse({ ...req.body, groupId });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid habit data" });
      }
      
      const habit = await storage.createGroupHabit({
        ...parsed.data,
        createdById: userId,
      });
      
      res.json(habit);
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(500).json({ message: "Failed to create habit" });
    }
  });

  app.delete("/api/groups/:groupId/habits/:habitId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = parseInt(req.params.groupId);
      const habitId = parseInt(req.params.habitId);
      
      const isMember = await storage.isGroupMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this group" });
      }
      
      const habit = await storage.getGroupHabit(habitId);
      if (!habit || habit.groupId !== groupId) {
        return res.status(404).json({ message: "Habit not found in this group" });
      }
      
      await storage.deleteGroupHabit(habitId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting habit:", error);
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  app.post("/api/groups/:groupId/habits/:habitId/toggle", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = parseInt(req.params.groupId);
      const habitId = parseInt(req.params.habitId);
      const { date } = req.body;
      
      const isMember = await storage.isGroupMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this group" });
      }
      
      const habit = await storage.getGroupHabit(habitId);
      if (!habit || habit.groupId !== groupId) {
        return res.status(404).json({ message: "Habit not found in this group" });
      }
      
      const completion = await storage.toggleGroupHabitCompletion(habitId, userId, date);
      res.json(completion);
    } catch (error) {
      console.error("Error toggling habit:", error);
      res.status(500).json({ message: "Failed to toggle habit" });
    }
  });

  app.get("/api/groups/:groupId/completions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = parseInt(req.params.groupId);
      
      const isMember = await storage.isGroupMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this group" });
      }
      
      const completions = await storage.getGroupCompletions(groupId);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching completions:", error);
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  app.get("/api/my-group-habits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getGroupsForUser(userId);
      
      const allHabits = [];
      const allCompletions = [];
      
      for (const group of groups) {
        const habits = await storage.getGroupHabits(group.id);
        const completions = await storage.getGroupCompletions(group.id);
        
        for (const habit of habits) {
          allHabits.push({
            ...habit,
            groupName: group.name,
            isGroupHabit: true
          });
        }
        
        const userCompletions = completions.filter((c: any) => c.userId === userId);
        allCompletions.push(...userCompletions);
      }
      
      res.json({ habits: allHabits, completions: allCompletions });
    } catch (error) {
      console.error("Error fetching group habits:", error);
      res.status(500).json({ message: "Failed to fetch group habits" });
    }
  });

  return httpServer;
}
