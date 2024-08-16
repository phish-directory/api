import express, { Request, Response } from "express";

import { prisma } from "../../../prisma";

/*
GET domain - Get all domains
GET domain:id - Get domain by ID
*/

const router = express.Router();

/**
 * GET /admin/domain
 * @summary Returns a list of all domains.
 * @tags Domain - Domain Ops
 * @security BearerAuth
 * @return {object} 200 - An array of domain objects.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const domains = await prisma.domain.findMany({
      orderBy: {
        id: "asc",
      },
    });
    res.status(200).json(domains);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching domains." });
  }
});

/**
 * GET /admin/domain/:id
 * @summary Returns a domain by its ID.
 * @tags Domain - Domain Ops
 * @security BearerAuth
 * @param {number} id.path - The ID of the domain to retrieve.
 * @return {object} 200 - A domain object.
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json("Domain ID is required");
    }

    const domain = await prisma.domain.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!domain) {
      return res.status(400).json("Domain not found");
    }

    res.status(200).json(domain);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the domain." });
  }
});

export default router;
