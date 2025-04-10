import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Custom schemas for the application
export const emotionSchema = z.object({
  emotion: z.enum(["happy", "sad", "angry", "neutral", "surprised", "fearful", "disgusted"]),
  probability: z.number(),
});

export type Emotion = z.infer<typeof emotionSchema>;

export const songSchema = z.object({
  id: z.string(),
  name: z.string(),
  artist: z.string(),
  album: z.string().optional(),
  imageUrl: z.string().optional(),
  previewUrl: z.string().optional(),
  emotion: z.enum(["happy", "sad", "angry", "neutral", "surprised", "fearful", "disgusted"]),
});

export type Song = z.infer<typeof songSchema>;

export const weatherSchema = z.object({
  temperature: z.number(),
  condition: z.string(),
  location: z.string(),
  icon: z.string(),
});

export type Weather = z.infer<typeof weatherSchema>;
