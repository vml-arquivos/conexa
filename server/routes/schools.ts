import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET all schools
router.get("/", async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: { students: true, inventory: true },
        },
      },
    });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schools" });
  }
});

// GET school by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
      include: {
        students: true,
        inventory: true,
      },
    });
    if (!school) {
      res.status(404).json({ error: "School not found" });
      return;
    }
    res.json(school);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch school" });
  }
});

// CREATE school
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, planType } = req.body;
    const school = await prisma.school.create({
      data: {
        name,
        planType: planType || "basic",
      },
    });
    res.status(201).json(school);
  } catch (error) {
    res.status(400).json({ error: "Failed to create school" });
  }
});

// UPDATE school
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, planType } = req.body;
    const school = await prisma.school.update({
      where: { id: req.params.id },
      data: { name, planType },
    });
    res.json(school);
  } catch (error) {
    res.status(400).json({ error: "Failed to update school" });
  }
});

// DELETE school
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.school.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Failed to delete school" });
  }
});

export default router;
