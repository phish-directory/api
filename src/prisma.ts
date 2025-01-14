import { Prisma, PrismaClient } from "@prisma/client";

const sanitizeData = (data: any): any => {
  // Return early for null or undefined
  if (data == null) return data;

  // Handle Date objects
  if (data instanceof Date) {
    return data;
  }

  // Handle strings
  if (typeof data === "string") {
    return data.replace(/\u0000/g, "");
  }

  // Handle objects and arrays
  if (typeof data === "object") {
    return Object.keys(data).reduce(
      (acc, key) => ({
        ...acc,
        [key]: sanitizeData(data[key]),
      }),
      Array.isArray(data) ? [] : {},
    );
  }

  return data;
};

// Define the sanitization extension
const sanitizationExtension = Prisma.defineExtension({
  name: "sanitization",
  query: {
    $allModels: {
      async create({ args, query }) {
        args.data = sanitizeData(args.data);
        return query(args);
      },
      async update({ args, query }) {
        args.data = sanitizeData(args.data);
        return query(args);
      },
      async upsert({ args, query }) {
        args.create = sanitizeData(args.create);
        args.update = sanitizeData(args.update);
        return query(args);
      },
      async createMany({ args, query }) {
        args.data = Array.isArray(args.data)
          ? args.data.map((item) => sanitizeData(item))
          : sanitizeData(args.data);
        return query(args);
      },
    },
  },
});

// Create extended client with sanitization
const prisma = new PrismaClient().$extends(sanitizationExtension);

export { prisma };
