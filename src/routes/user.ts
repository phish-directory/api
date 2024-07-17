import { PrismaClient } from "@prisma/client";
import * as express from "express";

const router = express.Router();
const prisma = new PrismaClient();

export default router;
