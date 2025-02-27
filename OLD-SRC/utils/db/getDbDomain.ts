import { prisma } from "../../prisma";
import { sanitizeDomain } from "../sanitizeDomain";

export async function getDbDomain(domain: string) {
  let sanitizedDomain = sanitizeDomain(domain);

  const dbDomain = await prisma.domain.findFirst({
    where: {
      domain: sanitizedDomain,
    },
  });

  if (!dbDomain) {
    return await prisma.domain.create({
      data: {
        domain: sanitizedDomain,
      },
    });
  }

  return dbDomain;
}
