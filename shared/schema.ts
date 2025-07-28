import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const medicines = pgTable("medicines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  genericName: varchar("generic_name"),
  category: varchar("category").notNull(),
  description: text("description"),
  dosage: varchar("dosage"),
  manufacturer: varchar("manufacturer"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pharmacies = pgTable("pharmacies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  phone: varchar("phone"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  isOpen: boolean("is_open").default(true),
  openTime: varchar("open_time"),
  closeTime: varchar("close_time"),
  deliveryAvailable: boolean("delivery_available").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicineInventory = pgTable("medicine_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicineId: varchar("medicine_id").notNull().references(() => medicines.id),
  pharmacyId: varchar("pharmacy_id").notNull().references(() => pharmacies.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"), // For anonymous users
  message: text("message").notNull(),
  isFromBot: boolean("is_from_bot").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSearches = pgTable("user_searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"), // For anonymous users
  query: varchar("query").notNull(),
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const anonymousChats = pgTable("anonymous_chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  ipAddress: varchar("ip_address"),
  chatCount: integer("chat_count").default(0),
  weekStart: timestamp("week_start").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used").defaultNow(),
});

// Relations
export const medicinesRelations = relations(medicines, ({ many }) => ({
  inventory: many(medicineInventory),
}));

export const pharmaciesRelations = relations(pharmacies, ({ many }) => ({
  inventory: many(medicineInventory),
}));

export const medicineInventoryRelations = relations(medicineInventory, ({ one }) => ({
  medicine: one(medicines, {
    fields: [medicineInventory.medicineId],
    references: [medicines.id],
  }),
  pharmacy: one(pharmacies, {
    fields: [medicineInventory.pharmacyId],
    references: [pharmacies.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  chatMessages: many(chatMessages),
  searches: many(userSearches),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const userSearchesRelations = relations(userSearches, ({ one }) => ({
  user: one(users, {
    fields: [userSearches.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertMedicineSchema = createInsertSchema(medicines).omit({
  id: true,
  createdAt: true,
});

export const insertPharmacySchema = createInsertSchema(pharmacies).omit({
  id: true,
  createdAt: true,
});

export const insertMedicineInventorySchema = createInsertSchema(medicineInventory).omit({
  id: true,
  lastUpdated: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertUserSearchSchema = createInsertSchema(userSearches).omit({
  id: true,
  createdAt: true,
});

export const insertAnonymousChatSchema = createInsertSchema(anonymousChats).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Pharmacy = typeof pharmacies.$inferSelect;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type MedicineInventory = typeof medicineInventory.$inferSelect;
export type InsertMedicineInventory = z.infer<typeof insertMedicineInventorySchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type UserSearch = typeof userSearches.$inferSelect;
export type InsertUserSearch = z.infer<typeof insertUserSearchSchema>;
export type AnonymousChat = typeof anonymousChats.$inferSelect;
export type InsertAnonymousChat = z.infer<typeof insertAnonymousChatSchema>;
