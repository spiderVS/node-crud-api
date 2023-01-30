import dotenv from "dotenv";
import server from "./server";

dotenv.config();
export const SERVER_PORT = process.env.PORT ? +process.env.PORT : 4000;

server.listen(SERVER_PORT, () => {
  console.log(`\nServer is running at http://localhost:${SERVER_PORT}/`);
});

let attempt = 0;
server.on('error', (e: Error) => {
  if ('code' in e && 'port' in e && e.code === 'EADDRINUSE') {
    console.log(
      `\nERROR: Port ${e.port} already in use.\nPlease kill all processes on port ${e.port} or change PORT in .env file and try again.\nRestart in 3 seconds`
    );

    server.close();

    setTimeout(() => {
      console.log(`\nTrying to restart server. Attempt: ${++attempt}...`);
      server.removeAllListeners('listening');
      server.listen(SERVER_PORT, () => {
        console.log(`\nServer is running at http://localhost:${SERVER_PORT}/`);
      });
    }, 3000);
  }
});
