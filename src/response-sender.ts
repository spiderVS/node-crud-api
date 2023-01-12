import { IncomingMessage, ServerResponse } from "node:http";
import { stringifyBody } from "./helpers/helpers";
import { ErrorMessageObject } from "./modules/models/error-message.model";
import { UserRecord } from "./modules/models/user-record.model";

const sendResponse = (
  response: ServerResponse<IncomingMessage>,
  statusCode: number,
  body?: UserRecord | UserRecord[] | ErrorMessageObject
): void => {
    response.writeHead(statusCode);
    body ? response.end(stringifyBody(body)) : response.end();
  }

export { sendResponse };
