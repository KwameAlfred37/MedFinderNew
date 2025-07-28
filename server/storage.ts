import {
  users,
  medicines,
  pharmacies,
  medicineInventory,
  chatMessages,
  userSearches,
  anonymousChats,
  type User,
  type UpsertUser,
  type Medicine,
  type InsertMedicine,
  type Pharmacy,
  type InsertPharmacy,
  type MedicineInventory,
  type InsertMedicineInventory,
  type ChatMessage,
  type InsertChatMessage,
  type UserSearch,
  type InsertUserSearch,
  type AnonymousChat,
  type InsertAnonymousChat,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Medicine operations
  searchMedicines(query: string): Promise<Medicine[]>;
  getMedicine(id: string): Promise<Medicine | undefined>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  
  // Pharmacy operations
  searchPharmacies(query: string, lat?: number, lng?: number): Promise<Pharmacy[]>;
  getPharmacy(id: string): Promise<Pharmacy | undefined>;
  createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy>;
  
  // Medicine inventory operations
  getMedicineAvailability(medicineId: string, lat?: number, lng?: number): Promise<(MedicineInventory & { pharmacy: Pharmacy; medicine: Medicine })[]>;
  updateInventory(inventory: InsertMedicineInventory): Promise<MedicineInventory>;
  
  // Chat operations
  getChatMessages(userId?: string, sessionId?: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Anonymous chat tracking
  getAnonymousChatUsage(sessionId: string, ipAddress?: string): Promise<AnonymousChat | undefined>;
  updateAnonymousChatUsage(sessionId: string, ipAddress?: string): Promise<AnonymousChat>;
  
  // Search history
  getUserSearches(userId?: string, sessionId?: string, limit?: number): Promise<UserSearch[]>;
  createUserSearch(search: InsertUserSearch): Promise<UserSearch>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Medicine operations
  async searchMedicines(query: string): Promise<Medicine[]> {
    return await db
      .select()
      .from(medicines)
      .where(
        ilike(medicines.name, `%${query}%`)
      )
      .limit(10);
  }

  async getMedicine(id: string): Promise<Medicine | undefined> {
    const [medicine] = await db.select().from(medicines).where(eq(medicines.id, id));
    return medicine;
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const [newMedicine] = await db.insert(medicines).values(medicine).returning();
    return newMedicine;
  }

  // Pharmacy operations
  async searchPharmacies(query: string, lat?: number, lng?: number): Promise<Pharmacy[]> {
    let queryBuilder = db.select().from(pharmacies);
    
    if (query) {
      queryBuilder = queryBuilder.where(ilike(pharmacies.name, `%${query}%`));
    }

    // If location is provided, order by distance (simplified)
    if (lat && lng) {
      return await queryBuilder
        .orderBy(
          sql`(${pharmacies.latitude} - ${lat})^2 + (${pharmacies.longitude} - ${lng})^2`
        )
        .limit(20);
    }

    return await queryBuilder.limit(20);
  }

  async getPharmacy(id: string): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.id, id));
    return pharmacy;
  }

  async createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy> {
    const [newPharmacy] = await db.insert(pharmacies).values(pharmacy).returning();
    return newPharmacy;
  }

  // Medicine inventory operations
  async getMedicineAvailability(medicineId: string, lat?: number, lng?: number): Promise<(MedicineInventory & { pharmacy: Pharmacy; medicine: Medicine })[]> {
    let queryBuilder = db
      .select()
      .from(medicineInventory)
      .innerJoin(pharmacies, eq(medicineInventory.pharmacyId, pharmacies.id))
      .innerJoin(medicines, eq(medicineInventory.medicineId, medicines.id))
      .where(and(
        eq(medicineInventory.medicineId, medicineId),
        sql`${medicineInventory.stock} > 0`
      ));

    // Order by distance if location provided
    if (lat && lng) {
      queryBuilder = queryBuilder.orderBy(
        sql`(${pharmacies.latitude} - ${lat})^2 + (${pharmacies.longitude} - ${lng})^2`
      );
    }

    const results = await queryBuilder.limit(20);
    
    return results.map(row => ({
      ...row.medicine_inventory,
      pharmacy: row.pharmacies,
      medicine: row.medicines,
    }));
  }

  async updateInventory(inventory: InsertMedicineInventory): Promise<MedicineInventory> {
    const [updated] = await db
      .insert(medicineInventory)
      .values({
        ...inventory,
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: [medicineInventory.medicineId, medicineInventory.pharmacyId],
        set: {
          price: inventory.price,
          stock: inventory.stock,
          lastUpdated: new Date(),
        },
      })
      .returning();
    return updated;
  }

  // Chat operations
  async getChatMessages(userId?: string, sessionId?: string, limit: number = 50): Promise<ChatMessage[]> {
    let queryBuilder = db.select().from(chatMessages);
    
    if (userId) {
      queryBuilder = queryBuilder.where(eq(chatMessages.userId, userId));
    } else if (sessionId) {
      queryBuilder = queryBuilder.where(eq(chatMessages.sessionId, sessionId));
    } else {
      return []; // Must provide either userId or sessionId
    }
    
    return await queryBuilder
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // Anonymous chat tracking
  async getAnonymousChatUsage(sessionId: string, ipAddress?: string): Promise<AnonymousChat | undefined> {
    const [usage] = await db
      .select()
      .from(anonymousChats)
      .where(eq(anonymousChats.sessionId, sessionId));
    return usage;
  }

  async updateAnonymousChatUsage(sessionId: string, ipAddress?: string): Promise<AnonymousChat> {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    
    const existing = await this.getAnonymousChatUsage(sessionId);
    
    if (existing) {
      // Check if we need to reset the week counter
      const existingWeekStart = new Date(existing.weekStart);
      const shouldReset = weekStart.getTime() > existingWeekStart.getTime();
      
      const [updated] = await db
        .update(anonymousChats)
        .set({
          chatCount: shouldReset ? 1 : existing.chatCount + 1,
          weekStart: shouldReset ? weekStart : existing.weekStart,
          lastUsed: now,
          ipAddress: ipAddress || existing.ipAddress,
        })
        .where(eq(anonymousChats.sessionId, sessionId))
        .returning();
      
      return updated;
    } else {
      const [newUsage] = await db
        .insert(anonymousChats)
        .values({
          sessionId,
          ipAddress,
          chatCount: 1,
          weekStart,
          lastUsed: now,
        })
        .returning();
      
      return newUsage;
    }
  }

  // Search history
  async getUserSearches(userId?: string, sessionId?: string, limit: number = 20): Promise<UserSearch[]> {
    let queryBuilder = db.select().from(userSearches);
    
    if (userId) {
      queryBuilder = queryBuilder.where(eq(userSearches.userId, userId));
    } else if (sessionId) {
      queryBuilder = queryBuilder.where(eq(userSearches.sessionId, sessionId));
    } else {
      return []; // Must provide either userId or sessionId
    }
    
    return await queryBuilder
      .orderBy(desc(userSearches.createdAt))
      .limit(limit);
  }

  async createUserSearch(search: InsertUserSearch): Promise<UserSearch> {
    const [newSearch] = await db.insert(userSearches).values(search).returning();
    return newSearch;
  }
}

export const storage = new DatabaseStorage();
