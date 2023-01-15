import { IncomingMessage, ServerResponse } from "node:http";
import { stringifyBody } from "./helpers";
import { ErrorMessageObject } from "../../modules/models/error-message.model";
import { UserRecord } from "../../modules/models/user-record.model";

const sendResponse = (
  response: ServerResponse<IncomingMessage>,
  statusCode: number,
  body?: UserRecord | UserRecord[] | ErrorMessageObject | string,
  asString: boolean = false
): void => {
    response.writeHead(statusCode);
    body ? response.end(asString ? body : stringifyBody(body)) : response.end();
  }

export { sendResponse };
