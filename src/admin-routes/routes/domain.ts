import express, { Request, Response } from "express";

import { domains } from "src/db/schema";
import { getDbDomain } from "src/func/db/domain";
import { db } from "src/utils/db";

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
  let alldomains = await db.select().from(domains);
  res.status(200).json(alldomains);
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
    let { id } = req.params;

    if (!id) {
      return res.status(400).json("Missing parameter: id");
    }

    let dbDomain = getDbDomain(id);

    if (!dbDomain) {
      return res.status(400).json("Domain not found");
    }

    res.status(200).json(dbDomain);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the domain." });
  }
});

export default router;
