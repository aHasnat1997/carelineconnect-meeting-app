import { initTRPC } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { prisma } from "@repo/db";
import type { Request, Response } from "express";

export const createContext = ({ req, res }: CreateExpressContextOptions): { req: Request; res: Response; prisma: typeof prisma } => {
  return { req, res, prisma };
};
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
