import express from "express";
import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { z } from "zod";

const appRouter = trpc.router().query("getUser", {
  input: (val: unknown) => {
    if (typeof val === "string") return val;
    throw new Error(`Invalid input: ${typeof val}`);
  },
  async resolve(req) {
    req.input; // string
    return { id: req.input, name: "Bilbo" };
  },
});

const app = express();

// created for each request
const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({}); // no context
type Context = trpc.inferAsyncReturnType<typeof createContext>;

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(4000);
