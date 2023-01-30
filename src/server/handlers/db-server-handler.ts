import { IncomingMessage, ServerResponse } from "node:http";
import { sendResponse } from "../helpers/response-sender";
import { ErrorMsgObj as EO } from '../../modules/error-message-object';
import { ERROR_MESSAGES as MSG } from '../../constants/error-messages';
import { DB } from "../../database/users-db";
import { getBody } from "../helpers/helpers";
import { UserRecord } from "../../modules/models/user-record.model";

export const dbServerHandler = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
) => {
  res.setHeader('Content-Type', 'application/json');
  const { method, url = '', headers } = req;

  const userId = typeof headers.id === 'string' ? headers.id : '';

  if (url !== '/db' && url !== '/db/') {
    sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
    return;
  }
  switch (method) {
    case 'GET':
      if (userId) {
        const foundUser = DB.findUserById(userId);
        if (!foundUser) {
          sendResponse(res, 404);
        } else {
          sendResponse(res, 200, foundUser);
        }
      } else {
        sendResponse(res, 200, DB.users);
      }
      break;
    case 'POST':
      {
        const body = (await getBody(req, true)) as UserRecord;
        if (body) {
          DB.add(body as UserRecord);
          sendResponse(res, 201, 'ok', true);
        }
      }
      break;
    case 'PUT':
      {
        const body = ((await getBody(req, true)) as UserRecord) || null;
        DB.update(body as UserRecord);
        sendResponse(res, 200, 'ok', true);
      }
      break;
    case 'DELETE':
      {
        if (userId) {
          DB.remove(DB.findUserById(userId)!);
          sendResponse(res, 204, 'ok', true);
        }
      }
      break;
    default:
      sendResponse(res, 405, new EO(MSG.NOT_ALLOWED));
      break;
  }
};
