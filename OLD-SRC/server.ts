import { createServer } from "node:http";
import { app } from "./app";
export const server = createServer(app);
