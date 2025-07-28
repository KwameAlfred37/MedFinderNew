import {
  users,
  medicines,
  pharmacies,
  medicineInventory,
  chatMessages,
  userSearches,
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
  getChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Search history
  getUserSearches(userId: string, limit?: number): Promise<UserSearch[]>;
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
  async getChatMessages(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // Search history
  async getUserSearches(userId: string, limit: number = 20): Promise<UserSearch[]> {
    return await db
      .select()
      .from(userSearches)
      .where(eq(userSearches.userId, userId))
      .orderBy(desc(userSearches.createdAt))
      .limit(limit);
  }

  async createUserSearch(search: InsertUserSearch): Promise<UserSearch> {
    const [newSearch] = await db.insert(userSearches).values(search).returning();
    return newSearch;
  }
}

export const storage = new DatabaseStorage();
