import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma config disables automatic .env loading, so we load it manually
import { config } from "dotenv";
config({ path: path.join(__dirname, "../../.env") });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
});
