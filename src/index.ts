import dotenv from "dotenv";
import { createNewServer } from './server/helpers/create-server';
import { singleServerHandler } from './server/handlers/single-server-handler';

dotenv.config();
export const SEVER_PORT = process.env.PORT ? +process.env.PORT : 4000;

 const callback = () => {
   console.log(`\nServer is running at http://localhost:${SEVER_PORT}/`);
 };

 createNewServer(SEVER_PORT, callback, singleServerHandler);
