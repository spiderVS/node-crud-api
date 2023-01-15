import { IncomingMessage, request, ServerResponse } from "node:http";
import { getIdString, isBaseUrl, isBaseUrlWithId, isValidId, isValidUrl, getBody } from "../helpers/helpers";
import { sendResponse } from "../helpers/response-sender";
import { ErrorMsgObj as EO } from '../../modules/error-message-object';
import { ERROR_MESSAGES as MSG } from '../../constants/error-messages';
import { USER_DB_PORT } from "../../index-balancer";
import { User } from '../../modules/user';
import { UserRequest } from "../../modules/models/user-request.model";
import { UserRecord } from "../../modules/models/user-record.model";

interface Options {
  hostname: string;
  port: number;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  headers: {
      [key: string]: string
  };
}

const getDataFromDB = (params: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  id?: string,
  body?: UserRecord
}): Promise<string> =>
  new Promise((resolve, reject) => {
    const { method, id = '', body } = params;


    const options: Options = {
      hostname: 'localhost',
      port: USER_DB_PORT,
      method,
      path: '/db',
      headers: {
        'content-type': 'application/json',
        'transfer-encoding': 'chunked',
      },
    };

    if (id) {
      options.headers = { ...options.headers, id };
    }

    const requestToDB = request(options, async (response) => {
      const responseFromDB = await getBody(response) as string;
      resolve(responseFromDB);
    });

    !!body && requestToDB.write(JSON.stringify(body));
    requestToDB.end();
  });

export const workerServerHandler = async(req: IncomingMessage, res: ServerResponse<IncomingMessage> & { req: IncomingMessage }) => {
  res.setHeader('Content-Type', 'application/json');
  const { method, url = '', headers } = req;

  console.log(`${method} http://localhost:${process.env.workerPort}${url}`);

  if (!(isValidUrl(url))) {
    sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
    return;
  }

  switch (method) {
    case 'GET':
      if (isBaseUrl(url)) {
        const data = await getDataFromDB({ method: 'GET' });
        sendResponse(res, 200, data, true);
      } else if (isBaseUrlWithId(url)) {
        const id = getIdString(url);
        if (!isValidId(id)) {
          sendResponse(res, 400, new EO(MSG.INVALID_UUID));
        } else {
          const data = await getDataFromDB({ method: 'GET', id}) || null;
          if (!data) {
            sendResponse(res, 404, new EO(MSG.RECORD_NOT_FOUND));
          } else {
            sendResponse(res, 200, data, true);
          }
        }
      }
      break;
    case 'POST':
      if (isBaseUrl(url)) {
          try {
            const inputBody = await getBody(req, true);
            const newUser = new User(inputBody as UserRequest);
            await getDataFromDB({ method: 'POST', body: newUser });
            sendResponse(res, 201, newUser)
          } catch (err) {
            if (err instanceof Error) {
              if (err.name === 'MISSING_REQ_FIELDS') {
                sendResponse(res, 400, new EO(MSG.MISSING_REQ_FIELDS));
              } else if (err.name === 'SyntaxError') {
                sendResponse(res, 500, new EO('Request body error: ' + err.message));
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
          const data = await getDataFromDB({ method: 'GET', id}) || null;
          if (!data) {
            sendResponse(res, 404, new EO(MSG.RECORD_NOT_FOUND));
          } else {
            try {
              const body = await getBody(req, true);
              const updatedUser = new User(body as UserRequest, id);
              await getDataFromDB({ method: 'PUT', body: updatedUser });
              sendResponse(res, 200, updatedUser);
            } catch (err) {
              if (err instanceof Error) {
                if (err.name === 'MISSING_REQ_FIELDS') {
                  sendResponse(res, 400, new EO(MSG.MISSING_REQ_FIELDS));
                } else if (err.name === 'SyntaxError') {
                  sendResponse(res, 500, new EO('Request body error: ' + err.message));
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
          const data = await getDataFromDB({ method: 'GET', id}) || null;
          if (!data) {
            sendResponse(res, 404, new EO(MSG.RECORD_NOT_FOUND));
          } else {
            await getDataFromDB({ method: 'DELETE', id });
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
}
