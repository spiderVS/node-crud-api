# Simple CRUD API

This is simple CRUD API using in-memory database underneath.

## Prepare

:warning: **Make sure you use the 18 LTS version of Node.js**

1. Clone my repository: `https://github.com/spiderVS/node-crud-api`
2. Go to directory `node-crud-api`.
3. Checkout to branch `crud-api-develop`
```bash
  git checkout crud-api-develop
```
4. To install all dependencies use
```bash
npm install
```
5. Create a new `.env` file with `PORT=4000` (or any other) in this folder.
For example see to file `.env-example`.

## Run scripts

1. Run single port server (development-mode with `nodemon`)
```bash
npm run start:dev
```
2. Create bundle of single port server and run it (production-mode) - you can see `bundle.js` into `dist`-directory.
```bash
npm run start:prod
```
3. Run server with balancer (development-mode with `nodemon`)
```bash
npm run start:multi-dev
```
4. Create bundle of server with balancer and run it (production-mode) - you can see `bundle-balancer.js` into `dist`-directory.
```bash
npm run start:multi
```
5. Run tests
```bash
npm run test
```

## Using the server

> You can use the clients for designing, debugging, and testing APIs - **Postman**, **Insomnia** etc.

**There is 2 different modes work of server:**
- **Single server**
  - Run with `npm run start:dev`(dev-mode) or `npm run start:prod`(prod-mode - bundle).
- **Server with load balancing**
  - Run with `npm run start:multi-dev`(dev-mode) or `npm run start:multi`(prod-mode - bundle).
### Available endpoints, methods and responses:

- **GET** `api/users` is used to get all persons
    - Server answer with `status code` **200** and all users records
- **GET** `api/users/${userId}`
    - Server answer with `status code` **200** and record with `id === userId` if it exists
    - Server answer with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
    - Server answer with `status code` **404** and corresponding message if record with `id === userId` doesn't exist
- **POST** `api/users` is used to create record about new user and store it in database
    - Server answer with `status code` **201** and newly created record
    - Server answer with `status code` **400** and corresponding message if request `body` does not contain **required** fields
- **PUT** `api/users/${userId}` is used to update existing user
    - Server answer with` status code` **200** and updated record
    - Server answer with` status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
    - Server answer with` status code` **404** and corresponding message if record with `id === userId` doesn't exist
- **DELETE** `api/users/${userId}` is used to delete existing user from database
    - Server answer with `status code` **204** if the record is found and deleted
    - Server answer with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
    - Server answer with `status code` **404** and corresponding message if record with `id === userId` doesn't exist

> Users have following properties:
> - `id` — unique identifier (`string`, `uuid`) generated on server side
> - `username` — user's name (`string`, **required**)
> - `age` — user's age (`number`, **required**)
> - `hobbies` — user's hobbies (`array` of `strings` or empty `array`, **required**)

- Requests to non-existing endpoints (e.g. `some-non/existing/resource`): server answer with `status code` **404** and corresponding human-friendly message.

- Errors on the server side that occur during the processing of a request: server answer with `status code` **500** and corresponding human-friendly message.


### Balancer-mode server

Used horizontal scaling for application - starts multiple instances of server equal to the number of logical processor cores on the host machine, each listening on port PORT + n) with a load balancer that distributes requests across them (using Round-robin algorithm).
