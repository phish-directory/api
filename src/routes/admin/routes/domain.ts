import express, { Request, Response } from "express";
import axios from "axios";

import { domainReport } from "../../../functions/domain";
import { getUserInfo } from "../../../functions/jwt";
import { prisma } from "../../../prisma";

/*
GET domain - Get all domains
GET domain:id - Get domain by ID
*/

const router = express.Router();

// Add type for report review request
interface ReportReviewRequest {
  approved: boolean;
}

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

/**
 * GET /admin/domain/reports
 * @summary Get pending domain reports
 * @tags Domain - Domain Ops
 * @security BearerAuth
 */
router.get("/reports", async (req: Request, res: Response) => {
  try {
    const reports = await prisma.domainReport.findMany({
      where: { status: "PENDING" },
      include: {
        domain: true,
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json(reports);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching reports." });
  }
});

/**
 * POST /admin/domain/reports/:id/review
 * @summary Review a domain report
 * @tags Domain - Domain Ops
 * @security BearerAuth
 */
router.post(
  "/reports/:id/review",
  async (
    req: Request<{ id: string }, {}, ReportReviewRequest>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const { approved } = req.body;

      if (typeof approved !== "boolean") {
        return res
          .status(400)
          .json({ error: "approved must be a boolean value" });
      }

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: "Invalid report ID" });
      }

      const user = await getUserInfo(prisma, res, req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const report = await prisma.domainReport.findUnique({
        where: { id: parseInt(id) },
        include: { domain: true },
      });

      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      try {
        await prisma.$transaction(async (tx) => {
          // Update report status
          await tx.domainReport.update({
            where: { id: report.id },
            data: {
              status: approved ? "APPROVED" : "REJECTED",
              reviewedAt: new Date(),
              reviewer: { connect: { id: user.id } },
            },
          });

          // If approved, mark domain as malicious and run domainReport
          if (approved) {
            await tx.domain.update({
              where: { id: report.domain.id },
              data: { malicious: true },
            });

            await axios.patch(
              "https://otx.alienvault.com/api/v1/pulses/6785dccb041b628fde283705",
              {
                indicators: {
                  add: [
                    {
                      indicator: `${report.domain.domain}`,
                      type: "domain",
                    },
                  ],
                },
              },
              {
                headers: {
                  Referer: "https://phish.directory",
                  "User-Agent": "internal-server@phish.directory",
                  "X-Identity": "internal-server@phish.directory",
                  "X-OTX-API-KEY": `${process.env.OTX_KEY!}`,
                },
              },
            );

            // Run domainReport function
            await domainReport(report.domain.domain);
          }
        });

        return res
          .status(200)
          .json(`Report ${approved ? "approved" : "rejected"}`);
      } catch (txError) {
        console.error("Transaction failed:", txError);
        return res.status(500).json({
          error: "Failed to process report review",
          details: txError instanceof Error ? txError.message : "Unknown error",
        });
      }
    } catch (error) {
      console.error("Error in report review endpoint:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while reviewing the report." });
    }
  },
);

export default router;
