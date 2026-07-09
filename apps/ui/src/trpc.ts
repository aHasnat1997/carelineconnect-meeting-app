import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../api/src/routers/index";

export const trpc = createTRPCReact<AppRouter>();
