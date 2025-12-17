import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET all inventory items
router.get("/", async (req: Request, res: Response) => {
  try {
    const items = await prisma.inventory.findMany({
      include: {
        school: true,
      },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// GET inventory by school
router.get("/school/:schoolId", async (req: Request, res: Response) => {
  try {
    const items = await prisma.inventory.findMany({
      where: { schoolId: req.params.schoolId },
      include: {
        school: true,
      },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// GET inventory by category
router.get("/school/:schoolId/category/:category", async (req: Request, res: Response) => {
  try {
    const items = await prisma.inventory.findMany({
      where: {
        schoolId: req.params.schoolId,
        category: req.params.category,
      },
      include: {
        school: true,
      },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// GET inventory item by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const item = await prisma.inventory.findUnique({
      where: { id: req.params.id },
      include: {
        school: true,
      },
    });
    if (!item) {
      res.status(404).json({ error: "Inventory item not found" });
      return;
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory item" });
  }
});

// CREATE inventory item
router.post("/", async (req: Request, res: Response) => {
  try {
    const { item, category, quantity, minThreshold, schoolId } = req.body;
    const inventoryItem = await prisma.inventory.create({
      data: {
        item,
        category,
        quantity,
        minThreshold,
        schoolId,
      },
      include: {
        school: true,
      },
    });
    res.status(201).json(inventoryItem);
  } catch (error) {
    res.status(400).json({ error: "Failed to create inventory item" });
  }
});

// UPDATE inventory item
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { item, category, quantity, minThreshold } = req.body;
    const inventoryItem = await prisma.inventory.update({
      where: { id: req.params.id },
      data: {
        item,
        category,
        quantity,
        minThreshold,
      },
      include: {
        school: true,
      },
    });
    res.json(inventoryItem);
  } catch (error) {
    res.status(400).json({ error: "Failed to update inventory item" });
  }
});

// DELETE inventory item
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.inventory.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Failed to delete inventory item" });
  }
});

export default router;
