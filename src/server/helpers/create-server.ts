import { createServer, IncomingMessage, ServerResponse } from 'node:http';

export const createNewServer = (
  port: number,
  callback: () => void,
  requestHandler: (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage> & {
      req: IncomingMessage;
    }
  ) => Promise<void>
) => {
  const server = createServer(requestHandler);

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
        server.listen(port, callback);
      }, 3000);
    }
  });

  server.listen(port, callback);
};
