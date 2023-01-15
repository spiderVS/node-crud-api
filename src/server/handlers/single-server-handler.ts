import { IncomingMessage, ServerResponse } from "node:http";
import { getBody, getIdString, isBaseUrl, isBaseUrlWithId, isValidId, isValidUrl } from "../helpers/helpers";
import { sendResponse } from "../helpers/response-sender";
import { ERROR_MESSAGES as MSG } from '../../constants/error-messages';
import { ErrorMsgObj as EO } from '../../modules/error-message-object';
import { DB } from '../../database/users-db';
import { UserRequest } from "../../modules/models/user-request.model";
import { User } from "../../modules/user";
import { SEVER_PORT } from "../..";

export const singleServerHandler = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) => {
  res.setHeader('Content-Type', 'application/json');
  const { method, url = '' } = req;
  console.log(`${method} http://localhost:${SEVER_PORT}${url}`);

  if (!isValidUrl(url)) {
    sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
    return;
  }

  switch (method) {
    case 'GET':
      if (isBaseUrl(url)) {
        sendResponse(res, 200, DB.users);
      } else if (isBaseUrlWithId(url)) {
        const id = getIdString(url);
        if (!isValidId(id)) {
          sendResponse(res, 400, new EO(MSG.INVALID_UUID));
        } else {
          const foundUser = DB.findUserById(id);
          if (!foundUser) {
            sendResponse(res, 404, new EO(MSG.RECORD_NOT_FOUND));
          } else {
            sendResponse(res, 200, foundUser);
          }
        }
      }
      break;
    case 'POST':
      if (isBaseUrl(url)) {
        try {
          const body = await getBody(req, true);
          const newUser = new User(body as UserRequest);
          DB.add(newUser);
          sendResponse(res, 201, newUser);
        } catch (err) {
          if (err instanceof Error) {
            if (err.name === 'MISSING_REQ_FIELDS') {
              sendResponse(res, 400, new EO(MSG.MISSING_REQ_FIELDS));
            } else {
              sendResponse(res, 500, new EO(err.message));
            }
          }
        }
        return;
      }
      sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
      break;
    case 'PUT':
      if (isBaseUrlWithId(url)) {
        const id = getIdString(url);
        if (!isValidId(id)) {
          sendResponse(res, 400, new EO(MSG.INVALID_UUID));
        } else {
          const foundUser = DB.findUserById(id);
          if (!foundUser) {
            sendResponse(res, 404, new EO(MSG.RECORD_NOT_FOUND));
          } else {
            try {
              const body = await getBody(req, true);
              const updatedUser = new User(body as UserRequest, id);
              DB.update(updatedUser);
              sendResponse(res, 200, updatedUser);
            } catch (err) {
              if (err instanceof Error) {
                if (err.name === 'MISSING_REQ_FIELDS') {
                  sendResponse(res, 400, new EO(MSG.MISSING_REQ_FIELDS));
                } else {
                  sendResponse(res, 500, new EO(err.message));
                }
              }
            }
          }
        }
        return;
      }
      sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
      break;
    case 'DELETE':
      if (isBaseUrlWithId(url)) {
        const id = getIdString(url);
        if (!isValidId(id)) {
          sendResponse(res, 400, new EO(MSG.INVALID_UUID));
        } else {
          const foundUser = DB.findUserById(id);
          if (!foundUser) {
            sendResponse(res, 404, new EO(MSG.RECORD_NOT_FOUND));
          } else {
            DB.remove(foundUser);
            sendResponse(res, 204);
          }
        }
        return;
      }
      sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
      break;
    default:
      sendResponse(res, 405, new EO(MSG.NOT_ALLOWED));
      break;
  }
};
