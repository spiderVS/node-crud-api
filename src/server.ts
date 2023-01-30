import { createServer } from "node:http";
// import { singleServerHandler } from "./server/handlers/single-server-handler";
import { singleServerHandler } from "./server/handlers/single-server-handler";

const server = createServer(singleServerHandler);

export default server;
