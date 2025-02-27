import express from "express";
const router = express.Router();

import { prisma } from "../../prisma";
import { getDbDomain } from "../../utils/db/getDbDomain";
import { domainReport } from "../../utils/domain/domainReport";
import { authenticateToken, getUserInfo } from "../../utils/jwt";

/**
 * POST /domain/report
 * @summary Report a domain as malicious
 * @description Reports a domain as potentially malicious. Submissions will be reviewed by a trusted user before being marked and submitted into our database.
 * @tags Domain - Endpoints for checking / reporting domains.
 * @security BearerAuth
 * @param {object} request.body.required - Domain report details
 * @return {object} 200 - Success message
 * @return {string} 400 - Error message
 * @example request - Domain report
 * {
 *   "domain": "malicious-site.com",
 *   "notes": "This site is attempting to steal banking credentials"
 * }
 */
router.post("/", authenticateToken, async (req, res) => {
  const { domain, notes } = req.body;
  const user = await getUserInfo(req);

  if (!domain) {
    return res.status(400).json("No domain parameter found");
  }

  // Get or create domain record
  let dbDomain = await getDbDomain(domain);

  // Create report
  const report = await prisma.domainReport.create({
    data: {
      domain: { connect: { id: dbDomain.id } },
      reporter: { connect: { id: user!.id } },
      notes,
    },
  });

  // If user is trusted/admin, automatically approve and mark domain as malicious
  if (user!.permission === "trusted" || user!.permission === "admin") {
    await prisma.$transaction([
      prisma.domainReport.update({
        where: { id: report.id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewer: { connect: { id: user!.id } },
        },
      }),
      prisma.domain.update({
        where: { id: dbDomain.id },
        data: { malicious: true },
      }),
    ]);

    await domainReport(domain);

    return res.status(200).json("Domain reported and marked as malicious");
  }

  return res.status(200).json("Domain report submitted for review");
});

export default router;
