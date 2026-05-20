import "dotenv/config";
import { defineConfig } from "prisma/config";

const isDev = process.env["NODE_ENV"] === "evelopment";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: isDev ? process.env["DIRECT_URL"]! : process.env["DATABASE_URL"]!,
  },
});