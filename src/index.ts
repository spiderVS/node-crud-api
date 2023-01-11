import { createServer } from 'node:http';
import dotenv from "dotenv";
import { sendResponse } from './response-sender';
import { USERS } from './constants/config';
import { findUserById, getIdString, getIndexById, isBaseUrl, isBaseUrlWithId, isValidId, isValidUrl } from './helpers/helpers';
import { User } from './modules/user';
import { ERROR_MESSAGES as MSG } from "./constants/error-messages";
import { ErrorMsgObj as EO} from './modules/error-message-object';

dotenv.config();
const port = process.env.PORT ? +(process.env.PORT) : 4000;

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const url = req.url ?? '';

  if (!(isValidUrl(url))) {
    sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
    return;
  }

  switch (req.method) {
    case 'GET':
      if (isBaseUrl(url)) {
          sendResponse(res, 200, USERS);
      } else if (isBaseUrlWithId(url)) {
        const id = getIdString(url);
        if (!isValidId(id)) {
          sendResponse(res, 400, new EO(MSG.INVALID_UUID));
        } else {
          const user = findUserById(USERS, id);
          if (!user) {
            sendResponse(res, 404, new EO(MSG.RECORD_NOT_FOUND));
          } else {
            sendResponse(res, 200, user);
          }
        }
      }
      break;
    case 'POST':
      if (isBaseUrl(url)) {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const parsedBody = JSON.parse(body);
            const user = new User(parsedBody);
            USERS.push(user);
            sendResponse(res, 201, user)
          } catch (err) {
            if (err instanceof Error) {
              if (err.name === 'MISSING_REQ_FIELDS') {
                sendResponse(res, 400, new EO(MSG.MISSING_REQ_FIELDS));
              } else {
                sendResponse(res, 500, new EO(err.message));
              }
            }
          }
        });
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
          const user = findUserById(USERS, id);
          if (!user) {
            sendResponse(res, 404, new EO(MSG.RECORD_NOT_FOUND));
          } else {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const parsedBody = JSON.parse(body);
                const user = new User(parsedBody, id);
                const index = getIndexById(USERS, id);
                USERS.splice(index, 1, user);
                sendResponse(res, 200, user);
              } catch (err) {
                if (err instanceof Error) {
                  if (err.name === 'MISSING_REQ_FIELDS') {
                    sendResponse(res, 400, new EO(MSG.MISSING_REQ_FIELDS));
                  } else {
                    sendResponse(res, 500, new EO(err.message));
                  }
                }
              }
            });
          }
        }
        return;
      }
      sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
      break;
    case 'DELETE':
      // handle DELETE request
      break;
    default:
      res.writeHead(405);
      res.end();
      break;
  }


});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
