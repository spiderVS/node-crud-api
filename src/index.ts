import { createServer } from 'node:http';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import dotenv from "dotenv";
import { UserRecord } from './models/user.model';
import { sendResponse } from './response-handler';
import { BASE_URL, USERS } from './constants/config';
import { findUserById, getIdString } from './helpers/helpers';

class User implements UserRecord {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  constructor({ username, age, hobbies }: UserRecord ) {
    if (!username || !age || !hobbies) {
      throw new Error('Request body does not contain required fields');
    } else {
      this.username = username;
      this.age = age;
      this.hobbies = hobbies;
      this.id = this._id;
    }
  }

  get _id() {
    return uuidv4();
  }
}

dotenv.config();
const port = process.env.PORT ? +(process.env.PORT) : 4000;

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url !== BASE_URL && !req.url?.includes(`${BASE_URL}/`)) {
    sendResponse(res, 404);
    return;
  }

  switch (req.method) {
    case 'GET':
      if (req.url === BASE_URL || req.url === `${BASE_URL}/`) {
        sendResponse(res, 200, USERS);
      } else if (req.url?.includes(`${BASE_URL}/`)) {
        const id = getIdString(req.url!, BASE_URL);
        if (id) {
          if (!uuidValidate(id)) {
            sendResponse(res, 400);
          } else {
            const user = findUserById(USERS, id);
            if (!user) {
              sendResponse(res, 404);
            } else {
              sendResponse(res, 200, user);
            }
          }
        }
      }
      break;
    case 'POST':
      if (req.url === BASE_URL) {

        // TODO: проверить все ли поля

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
              if (err.message === 'Request body does not contain required fields') {
                sendResponse(res, 400, err.message);
              } else {
                sendResponse(res, 500, err.message);
              }
            }
          }
        });
        return;
      }
      res.writeHead(405);
      res.end();
      break;
    case 'PUT':
      // handle PUT request
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
