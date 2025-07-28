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
  // Sample medicine data for testing
  private sampleMedicines = [
    { id: "1", name: "Paracetamol", category: "Pain Relief", dosage: "500mg", manufacturer: "Generic Pharma", description: "Common pain reliever and fever reducer" },
    { id: "2", name: "Ibuprofen", category: "Pain Relief", dosage: "400mg", manufacturer: "Advil Labs", description: "Anti-inflammatory pain relief medication" },
    { id: "3", name: "Aspirin", category: "Pain Relief", dosage: "325mg", manufacturer: "Bayer", description: "Blood thinner and pain reliever" },
    { id: "4", name: "Amoxicillin", category: "Antibiotic", dosage: "250mg", manufacturer: "Antibio Corp", description: "Broad-spectrum antibiotic" },
    { id: "5", name: "Omeprazole", category: "Gastric", dosage: "20mg", manufacturer: "Stomach Care", description: "Proton pump inhibitor for acid reflux" },
    { id: "6", name: "Metformin", category: "Diabetes", dosage: "500mg", manufacturer: "Diabetic Solutions", description: "Type 2 diabetes medication" },
    { id: "7", name: "Lisinopril", category: "Blood Pressure", dosage: "10mg", manufacturer: "CardioMed", description: "ACE inhibitor for high blood pressure" },
    { id: "8", name: "Atorvastatin", category: "Cholesterol", dosage: "20mg", manufacturer: "LipidCare", description: "Statin for cholesterol management" },
    { id: "9", name: "Levothyroxine", category: "Thyroid", dosage: "50mcg", manufacturer: "ThyroMed", description: "Thyroid hormone replacement" },
    { id: "10", name: "Amlodipine", category: "Blood Pressure", dosage: "5mg", manufacturer: "CardioMed", description: "Calcium channel blocker" }
  ];

  private samplePharmacies = [
    { id: "1", name: "HealthPlus Pharmacy", address: "123 Main St", phone: "+1-555-0101", hours: "8 AM - 10 PM", coordinates: { lat: 40.7128, lng: -74.0060 } },
    { id: "2", name: "MediCare Central", address: "456 Oak Ave", phone: "+1-555-0102", hours: "24/7", coordinates: { lat: 40.7589, lng: -73.9851 } },
    { id: "3", name: "Quick Relief Pharmacy", address: "789 Pine Rd", phone: "+1-555-0103", hours: "7 AM - 11 PM", coordinates: { lat: 40.7505, lng: -73.9934 } },
    { id: "4", name: "Family Drug Store", address: "321 Elm St", phone: "+1-555-0104", hours: "9 AM - 9 PM", coordinates: { lat: 40.7282, lng: -74.0776 } },
    { id: "5", name: "Express Meds", address: "654 Cedar Ave", phone: "+1-555-0105", hours: "6 AM - Midnight", coordinates: { lat: 40.7614, lng: -73.9776 } }
  ];
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
    // Use sample data for testing until database is populated
    const searchTerm = query.toLowerCase();
    const results = this.sampleMedicines.filter(medicine =>
      medicine.name.toLowerCase().includes(searchTerm) ||
      medicine.category.toLowerCase().includes(searchTerm) ||
      medicine.manufacturer.toLowerCase().includes(searchTerm) ||
      medicine.description.toLowerCase().includes(searchTerm)
    );
    
    return results.slice(0, 10).map(med => ({
      id: med.id,
      name: med.name,
      category: med.category,
      dosage: med.dosage,
      manufacturer: med.manufacturer,
      description: med.description,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
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
    // Use sample data for testing
    let results = this.samplePharmacies;
    
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(searchTerm) ||
        pharmacy.address.toLowerCase().includes(searchTerm)
      );
    }

    return results.slice(0, 20).map(pharmacy => ({
      id: pharmacy.id,
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      hours: pharmacy.hours,
      latitude: pharmacy.coordinates.lat,
      longitude: pharmacy.coordinates.lng,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
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
