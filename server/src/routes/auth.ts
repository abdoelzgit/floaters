import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-ukk-bazma";

// Register route
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["admin", "staff", "customer", "manager"])
      .withMessage("Invalid role option"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, password, role } = req.body;

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(400).json({ message: "Email is already registered" });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || "customer",
          // Auto-verify email in development/simple flow if needed, or leave unverified
          email_verified_at: null,
        },
      });

      // Avoid returning password or bigint directly (convert bigint to string)
      const userResponse = {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };

      res.status(201).json({
        message: "User registered successfully. Please verify your email.",
        user: userResponse,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      // Generate JWT
      const token = jwt.sign(
        {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          email_verified_at: user.email_verified_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// Verify Email route
router.post(
  "/verify-email",
  [body("email").isEmail().withMessage("Valid email is required")],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      await prisma.user.update({
        where: { email },
        data: {
          email_verified_at: new Date(),
        },
      });

      res.json({ message: "Email verified successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
