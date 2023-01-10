import { IncomingMessage, ServerResponse } from "node:http";
import { HTTP_ERROR_MESSAGES as ERROR_MSGS } from "./constants/error-messages";
import { stringifyBody } from "./helpers/helpers";
import { HttpErrorMessageObject } from "./models/http-error-message";
import { UserRecord } from "./models/user.model";

const sendResponse = (
  response: ServerResponse<IncomingMessage>,
  statusCode: number,
  body?: UserRecord | UserRecord[] | string
): void => {
  response.writeHead(statusCode);
  let responseBody:  UserRecord | UserRecord[] | HttpErrorMessageObject | string = body ?? '';

  // for errors
  if (statusCode >= 400 && statusCode <= 599) {
    const errorObj: HttpErrorMessageObject = {
        error: {
          message: (ERROR_MSGS[`${statusCode}`] && typeof body !== 'string')
            ? 'Unknown error'
            : body as string
        }
      }
    responseBody = errorObj;
  }

  responseBody ? response.end(stringifyBody(responseBody)) : response.end();
}

export { sendResponse };
