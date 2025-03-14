import { prisma } from "../../utils/prisma";
import { sanitizeDomain } from "../../utils/sanitizeDomain";

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
