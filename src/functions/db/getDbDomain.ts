import { prisma } from "../../prisma";

export async function getDbDomain(domain: string) {
  const dbDomain = await prisma.domain.findFirst({
    where: {
      domain: domain,
    },
  });

  if (!dbDomain) {
    return await prisma.domain.create({
      data: {
        domain: domain,
      },
    });
  }

  return dbDomain;
}
