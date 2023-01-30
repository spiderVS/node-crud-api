import { IncomingMessage, request, ServerResponse } from "node:http";
import { numCPUs, PORT } from "../../index-balancer";
import { getBody } from "../helpers/helpers";

let index = 1;
const getPort = (): number => {
  index = index <= numCPUs ? index : 1;
  return PORT + index++;
}

export const balancerServerHandler = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) => {
  res.setHeader('Content-Type', 'application/json');

  const { method, url = '', headers } = req;
  const body = (await getBody(req)) || null;

  const options = {
    hostname: 'localhost',
    port: getPort(),
    method,
    headers,
    path: url,
  };

  const requestToWorker = request(options, async (response) => {
    const responseFromWorker = await getBody(response);
    res.writeHead(response.statusCode!);
    res.end(responseFromWorker);
  });

  !!body && requestToWorker.write(body);
  requestToWorker.end();
};
