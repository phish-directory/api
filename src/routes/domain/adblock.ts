import express from "express";
import { prisma } from "../../utils/prisma";
const router = express.Router();

async function getAllDomains() {
  const domains = await prisma.domain.findMany({
    where: {
      malicious: true,
    },
  });

  // specifically get the domain names
  const domainNames = domains.map((domain) => domain.domain);
  return domainNames;
}

/**
 * GET /adblock/adgaurd
 * @summary AdGuard adblocker adlist
 * @description Returns the AdGuard adblocker adlist
 * @tags Adblock - Endpoints for adblocker lists
 * @return {string} 200 - AdGuard adblocker adlist
 */
router.get("/adgaurd", async (req, res) => {
  const domains = await getAllDomains();

  const header = [
    "! Title: phish.directory AdGuard Filters",
    "! Description: Auto-generated filter list from https://phish.directory",
    `! Last updated: ${new Date().toISOString()}`,
    "! Homepage: https://phish.directory",
    "! Contact: support@phish.directory",
    "!",
  ].join("\n");

  // add the domains to the filter list
  const filters = domains.map((domain) => `||${domain}^`).join("\n");

  // Set content type for filter list
  res.setHeader("Content-Type", "text/plain");
  res.send(`${header}\n${filters}`);
});

/**
 * GET /adblock/ublock
 * @summary uBlock Origin adblocker adlist
 * @description Returns the uBlock Origin adblocker adlist
 * @tags Adblock - Endpoints for adblocker lists
 * @return {string} 200 - uBlock Origin adblocker adlist
 */
router.get("/ublock", async (req, res) => {
  const domains = await getAllDomains();

  const header = [
    "! Title: phish.directory uBlock Origin Filters",
    "! Description: Auto-generated filter list from https://phish.directory",
    `! Last updated: ${new Date().toISOString()}`,
    "! Homepage: https://phish.directory",
    "! Contact: support@phish.directory",
    "!",
  ].join("\n");

  // add the domains to the filter list
  const filters = domains.map((domain) => `||${domain}^`).join("\n");

  // Set content type for filter list
  res.setHeader("Content-Type", "text/plain");
  res.send(`${header}\n${filters}`);
});

/**
 * GET /adblock/pihole
 * @summary Pi-hole adblocker adlist
 * @description Returns the Pi-hole adblocker adlist
 * @tags Adblock - Endpoints for adblocker lists
 * @return {string} 200 - Pi-hole adblocker adlist
 */
router.get("/pihole", async (req, res) => {
  const domains = await getAllDomains();

  const header = [
    "# Title: phish.directory Pi-hole Filters",
    "# Description: Auto-generated filter list from https://phish.directory",
    `# Last updated: ${new Date().toISOString()}`,
    "# Homepage: https://phish.directory",
    "# Contact: support@phish.directory",
    "#",
  ].join("\n");

  res.setHeader("Content-Type", "text/plain");
  res.send(`${header}\n${domains.join("\n")}`);
});

export default router;
