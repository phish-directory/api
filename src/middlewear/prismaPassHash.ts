import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  if (params.model === "User") {
    if (params.action === "create" || params.action === "update") {
      if (params.args.data.password) {
        const hash = await bcrypt.hash(params.args.data.password, 10);
        params.args.data.password = hash;
      }
    }
  }
  return next(params);
});

// Now you can use prisma as usual
(async () => {
  await prisma.user.create({
    data: {
      email: "test@example.com",
      password: "plaintextpassword", // this will be hashed
    },
  });
})();
