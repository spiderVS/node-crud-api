import { createServer } from 'node:http';
import dotenv from "dotenv";
import { sendResponse } from './response-sender';
import { getIdString, isBaseUrl, isBaseUrlWithId, isValidId, isValidUrl, parseBody } from './helpers/helpers';
import { User } from './modules/user';
import { ERROR_MESSAGES as MSG } from "./constants/error-messages";
import { ErrorMsgObj as EO} from './modules/error-message-object';
import { UsersDB } from './database/users-db';

import cluster from 'node:cluster';
import { cpus } from 'node:os';
import process from 'node:process';

dotenv.config();
const port = process.env.PORT ? +(process.env.PORT) : 4000;

const USER_DB: UsersDB = new UsersDB();

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers
  for (let i = 1; i <= numCPUs; i++) {
    const worker = cluster.fork({ p: 1000 });
    // worker.send({ portCL: 4000 + i })
  }

  cluster.on('fork', worker => {console.log('MASTER: Создан worker c id', worker.id)});
  // cluster.on('listening', (worker, addr) => {
  //   console.log(`Host: ${addr.address}, Port: ${addr.port}`);
  // });
  // cluster.on('online', worker => {console.log('Worker online:', worker.id)});
  cluster.on('message', (worker, message) => {console.log(`MASTER: Сообщение от worker ${worker.id}:`, message);});


  cluster.on('exit', (worker, code, signal) => {
    console.log(`MASTER: Worker ${worker.process.pid} died`);
  });


  // function messageHandler(msg: any) {
  //   console.log('Сообщение от worker', msg);
  // }
  // console.log('🚀 cluster.workers:', cluster.workers);

  // for (const id in cluster.workers) {
  //   cluster.workers[id]!.on('message', messageHandler);
  // }

  for (const id in cluster.workers) {
    cluster.workers[id]!.send({ portCL: 4000 + +id });
  }

  createServer((req, res) => {
    // console.log('🚀 req:', req);
    // console.log('🚀 res:', res);
    res.writeHead(200);
    res.end();
  }).listen(port, () => {
    console.log(`Master Server listening on port ${port}`);
    console.log(`Master pid: ${process.pid} started`);
  });

} else if (cluster.isWorker) {

  console.log('process.env.p', process.env.p)

  process.on('message', (msg: { portCL: number }) => {
    // console.log('WORKER: Сообщение от мастер процесса:', msg);
    const { portCL } = msg;

    const workerServer = createServer((req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    });

    workerServer.listen(portCL, () => {
      console.log(`Worker id: ${cluster.worker!.id} pid: ${process.pid} - Server listening on port ${portCL}`);
      // process.send!(`Worker send - worker pid ${process.pid} started`);
    });
  });


}

// const server = createServer(async (req, res) => {
//   res.setHeader('Content-Type', 'application/json');
//   const { method, url = ''  } = req;

//   if (!(isValidUrl(url))) {
//     sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
//     return;
//   }

//   switch (method) {
//     case 'GET':
//       if (isBaseUrl(url)) {
//           sendResponse(res, 200, USER_DB.users);
//       } else if (isBaseUrlWithId(url)) {
//         const id = getIdString(url);
//         if (!isValidId(id)) {
//           sendResponse(res, 400, new EO(MSG.INVALID_UUID));
//         } else {
//           const foundUser = USER_DB.findUserById(id);
//           if (!foundUser) {
//             sendResponse(res, 404, new EO(MSG.RECORD_NOT_FOUND));
//           } else {
//             sendResponse(res, 200, foundUser);
//           }
//         }
//       }
//       break;
//     case 'POST':
//       if (isBaseUrl(url)) {
//           try {
//             const body = await parseBody(req);
//             const newUser = new User(body);
//             USER_DB.add(newUser);
//             sendResponse(res, 201, newUser)
//           } catch (err) {
//             if (err instanceof Error) {
//               if (err.name === 'MISSING_REQ_FIELDS') {
//                 sendResponse(res, 400, new EO(MSG.MISSING_REQ_FIELDS));
//               } else {
//                 sendResponse(res, 500, new EO(err.message));
//               }
//             }
//           }
//         return;
//       }
//       sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
//       break;
//     case 'PUT':
//       if (isBaseUrlWithId(url)) {
//         const id = getIdString(url);
//         if (!isValidId(id)) {
//           sendResponse(res, 400, new EO(MSG.INVALID_UUID));
//         } else {
//           const foundUser = USER_DB.findUserById(id);
//           if (!foundUser) {
//             sendResponse(res, 404, new EO(MSG.RECORD_NOT_FOUND));
//           } else {
//             try {
//               const body = await parseBody(req);
//               const updatedUser = new User(body, id);
//               USER_DB.update(updatedUser);
//               sendResponse(res, 200, updatedUser);
//             } catch (err) {
//               if (err instanceof Error) {
//                 if (err.name === 'MISSING_REQ_FIELDS') {
//                   sendResponse(res, 400, new EO(MSG.MISSING_REQ_FIELDS));
//                 } else {
//                   sendResponse(res, 500, new EO(err.message));
//                 }
//               }
//             }
//           }
//         }
//         return;
//       }
//       sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
//       break;
//     case 'DELETE':
//       if (isBaseUrlWithId(url)) {
//         const id = getIdString(url);
//         if (!isValidId(id)) {
//           sendResponse(res, 400, new EO(MSG.INVALID_UUID));
//         } else {
//           const foundUser = USER_DB.findUserById(id);
//           if (!foundUser) {
//             sendResponse(res, 404, new EO(MSG.RECORD_NOT_FOUND));
//           } else {
//             USER_DB.remove(foundUser);
//             sendResponse(res, 204);
//           }
//         }
//         return;
//       }
//       sendResponse(res, 404, new EO(MSG.URL_NOT_FOUND));
//       break;
//     default:
//       sendResponse(res, 405, new EO(MSG.NOT_ALLOWED));
//       break;
//   }
// });

// server.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });
