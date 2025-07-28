import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMedicineSchema, insertPharmacySchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Medicine search routes
  app.get('/api/medicines/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const medicines = await storage.searchMedicines(q);
      res.json(medicines);
    } catch (error) {
      console.error("Error searching medicines:", error);
      res.status(500).json({ message: "Failed to search medicines" });
    }
  });

  app.get('/api/medicines/:id', async (req, res) => {
    try {
      const medicine = await storage.getMedicine(req.params.id);
      if (!medicine) {
        return res.status(404).json({ message: "Medicine not found" });
      }
      res.json(medicine);
    } catch (error) {
      console.error("Error fetching medicine:", error);
      res.status(500).json({ message: "Failed to fetch medicine" });
    }
  });

  app.post('/api/medicines', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(validatedData);
      res.status(201).json(medicine);
    } catch (error) {
      console.error("Error creating medicine:", error);
      res.status(500).json({ message: "Failed to create medicine" });
    }
  });

  // Pharmacy search routes
  app.get('/api/pharmacies/search', async (req, res) => {
    try {
      const { q, lat, lng } = req.query;
      const latitude = lat ? parseFloat(lat as string) : undefined;
      const longitude = lng ? parseFloat(lng as string) : undefined;
      
      const pharmacies = await storage.searchPharmacies(
        (q as string) || '', 
        latitude, 
        longitude
      );
      res.json(pharmacies);
    } catch (error) {
      console.error("Error searching pharmacies:", error);
      res.status(500).json({ message: "Failed to search pharmacies" });
    }
  });

  app.get('/api/pharmacies/:id', async (req, res) => {
    try {
      const pharmacy = await storage.getPharmacy(req.params.id);
      if (!pharmacy) {
        return res.status(404).json({ message: "Pharmacy not found" });
      }
      res.json(pharmacy);
    } catch (error) {
      console.error("Error fetching pharmacy:", error);
      res.status(500).json({ message: "Failed to fetch pharmacy" });
    }
  });

  app.post('/api/pharmacies', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPharmacySchema.parse(req.body);
      const pharmacy = await storage.createPharmacy(validatedData);
      res.status(201).json(pharmacy);
    } catch (error) {
      console.error("Error creating pharmacy:", error);
      res.status(500).json({ message: "Failed to create pharmacy" });
    }
  });

  // Medicine availability routes
  app.get('/api/medicines/:id/availability', async (req, res) => {
    try {
      const { lat, lng } = req.query;
      const latitude = lat ? parseFloat(lat as string) : undefined;
      const longitude = lng ? parseFloat(lng as string) : undefined;
      
      const availability = await storage.getMedicineAvailability(
        req.params.id,
        latitude,
        longitude
      );
      res.json(availability);
    } catch (error) {
      console.error("Error fetching medicine availability:", error);
      res.status(500).json({ message: "Failed to fetch medicine availability" });
    }
  });

  // Search functionality for medicines and pharmacies combined
  app.get('/api/search', async (req, res) => {
    try {
      const { q, lat, lng } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const latitude = lat ? parseFloat(lat as string) : undefined;
      const longitude = lng ? parseFloat(lng as string) : undefined;

      const [medicines, pharmacies] = await Promise.all([
        storage.searchMedicines(q),
        storage.searchPharmacies(q, latitude, longitude),
      ]);

      res.json({
        medicines,
        pharmacies,
      });
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  // Chat routes
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        userId,
      });
      
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  // Search history routes
  app.get('/api/search/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const searches = await storage.getUserSearches(userId);
      res.json(searches);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          // Broadcast the message to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                data: message.data,
                timestamp: new Date().toISOString(),
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
