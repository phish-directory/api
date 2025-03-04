import express from "express";
const router = express.Router();

import { Classifications } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { authenticateToken } from "../../utils/jwt";
import { prisma } from "../../utils/prisma";

/**
 * PUT /domain/classify
 * @summary Classify a domain to specific types (scam, phishing, etc.)
 * @description Classify a domain to specific types (scam, phishing, etc.).
 The classification parameter should be one of the following: "postal", "banking", "item_scams", or "other".
 (Check the ClassificationType enum for more information) (see swagger ui)

 This endpoint requires TRUSTED level access. To check if you have this access run /user/me with your token.

 To request trusted level access or a new classification type, contact Jasper via email at jasper.mayone@phish.directory or via Slack.
 * @tags Domain - Endpoints for checking / reporting domains.
 * @security BearerAuth
 * @param {object} request.body.required - Domain Classification Body
 * @return {object} 200 - Success message
 * @return {string} 400 - Error message
 * @example response - 200 - Success message
 * "Domain classified successfully"
 */
router.put("/", authenticateToken, async (req, res) => {
  const data = req.body;
  const domain = data.domain;
  const classification = data.classification;

  if (!domain) {
    return res.status(400).json("No domain parameter found");
  }

  if (!classification) {
    return res.status(400).json("No classification parameter found");
  }

  // validate classification against enum
  if (!Object.values(Classifications).includes(classification)) {
    return res.status(400).json("Invalid classification parameter");
  }

  // get authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  // decode the token
  let decoded = jwt.decode(token);

  if (!decoded) {
    return res.status(400).json("Invalid token");
  }

  let user = await prisma.user.findUnique({
    where: {
      // @ts-expect-error
      id: decoded.id,
    },
  });

  if (!user) {
    return res.status(400).json("User not found");
  }

  let trustedTypes = ["trusted", "admin"];

  if (user.permission !== "basic" && trustedTypes.includes(user.permission)) {
    let dbDomain = await prisma.domain.findFirst({
      where: {
        domain: domain,
      },
    });

    let databaseDomain = await prisma.domain.findFirst({
      where: {
        domain: domain,
      },
    });

    if (!databaseDomain) {
      databaseDomain = await prisma.domain.create({
        data: {
          domain: domain,
        },
      });
    }

    await prisma.classification.create({
      data: {
        domain: {
          connect: {
            id: databaseDomain.id,
          },
        },
        classifier: {
          connect: {
            id: user.id,
          },
        },
        classification: classification,
      },
    });

    return res.status(200).json("Domain classified successfully");
  } else {
    return res.status(403).json("Unauthorized");
  }
});

export default router;
