import { prisma } from "../../prisma";

export async function getDbUser(id: number) {
  const dbUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  return dbUser;
}
