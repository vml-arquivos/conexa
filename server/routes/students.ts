import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET all students
router.get("/", async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        school: true,
      },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// GET students by school
router.get("/school/:schoolId", async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      where: { schoolId: req.params.schoolId },
      include: {
        school: true,
      },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// GET student by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        school: true,
      },
    });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// CREATE student
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, classId, schoolId, profileData, healthData } = req.body;
    const student = await prisma.student.create({
      data: {
        name,
        classId,
        schoolId,
        profileData: profileData || {},
        healthData: healthData || {},
      },
      include: {
        school: true,
      },
    });
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: "Failed to create student" });
  }
});

// UPDATE student
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, classId, profileData, healthData } = req.body;
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        name,
        classId,
        profileData,
        healthData,
      },
      include: {
        school: true,
      },
    });
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: "Failed to update student" });
  }
});

// DELETE student
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.student.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Failed to delete student" });
  }
});

export default router;
