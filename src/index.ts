import { createServer } from 'node:http';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import dotenv from "dotenv";
import { User } from './models/user.model';

dotenv.config();
const port = (process.env.PORT ? +process.env.PORT : null) || 4000;

const BASE_URL = '/api/users'
const USERS: User[] = [];

const getIdString = (url: string): string => {
  return url.slice(`${BASE_URL}/`.length);
}

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url !== `${BASE_URL}` && !req.url?.includes(`${BASE_URL}/`)) {
    res.writeHead(404);
    res.end(JSON.stringify(
      { error: {
          message: `The requested URL ${req.url} was not found`
        }
      }));
    return;
  }

  switch (req.method) {
    case 'GET':
      if (req.url === `${BASE_URL}` || req.url === `${BASE_URL}/`) {
        res.writeHead(200);
        res.end(JSON.stringify(USERS));
      } else if (req.url?.includes(`${BASE_URL}/`)) {
        const id = getIdString(req.url!);
        if (!uuidValidate(id)) {
          res.writeHead(400);
          res.end(JSON.stringify(
            { error: {
                message: `The requested id ${id} is invalid (not uuid)`
              }
            }));
        } else {
          const user = USERS.find((user: User) => user.id === id);
          if (!user) {
            res.writeHead(404);
            res.end(JSON.stringify(
              { error: {
                  message: `The record with id ${id} doesn't exist`
                }
              }));
              return;
          } else {
            res.writeHead(200);
            res.end(JSON.stringify(user));
          }
        }
      }
      break;
    case 'POST':
      if (req.url === `${BASE_URL}`) {
        const id: string = uuidv4();

        // TODO: проверить все ли поля

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const parsedBody = JSON.parse(body);
            const newRecord = { id, ...parsedBody };
            USERS.push(newRecord);
            res.writeHead(201);
            res.end(JSON.stringify(newRecord));
          } catch (err) {
            if (err instanceof Error) {
              res.writeHead(500);
              res.end(JSON.stringify(
                { error: {
                  message: `${err.message}`
                }
              }
              ));
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
