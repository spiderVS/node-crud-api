import dotenv from 'dotenv';
import { cpus } from 'node:os';
import cluster from 'node:cluster';
import process from 'node:process';
import { createNewServer } from './server/helpers/create-server';
import { workerServerHandler } from './server/handlers/worker-server-handler';
import { balancerServerHandler } from './server/handlers/balancer-server-hanlder';
import { dbServerHandler } from './server/handlers/db-server-handler';

dotenv.config();
export const PORT = process.env.PORT ? +process.env.PORT : 4000;
export const numCPUs = cpus().length;
export const USER_DB_PORT: number = PORT + numCPUs + 1;

const start = async () => {
  if (cluster.isPrimary) { // Master
    const fork = (port: number, workerType: 'db' | 'balancer_worker'): Promise<void> => {
      return new Promise((res, rej) => {
        const worker = cluster.fork({ workerType: workerType, workerPort: port });
        worker.once('listening', res);
      });
    };

    console.log('\nServer starting, please wait...');
    console.log(' |\n `- Prepare DB worker...');

    await fork(USER_DB_PORT, 'db');

    console.log(' |\n `- Prepare balancer workers...');

    for (let i = 1; i <= numCPUs; i++) {
      await fork(PORT + i, 'balancer_worker');
    }

    const callback = () => {
      console.log(`\nServer is running at http://localhost:${PORT}/`);
    };

    createNewServer(PORT, callback, balancerServerHandler);

  } else if (cluster.isWorker) { // Worker

    const workerPort = +process.env.workerPort!;

    if (process.env.workerType === 'balancer_worker') {
      const callback = () => {
        console.log(
          `    \`- Worker id: ${cluster.worker!.id} pid: ${process.pid} - Server listen on port ${workerPort}`
        );
      };
      createNewServer(workerPort, callback, workerServerHandler);

    } else if (process.env.workerType === 'db') {

      const callback = () => {
        console.log(
          ` |  \`- Worker id: ${cluster.worker!.id} pid: ${process.pid} - DB Server listen on port ${workerPort}`
        );
      };
      createNewServer(workerPort, callback, dbServerHandler);

    }
  }
};

start();
