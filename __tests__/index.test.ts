import request from 'supertest';
import server from '../src/server';

const user = {
  username: 'Vasya',
  age: 12,
  hobbies: ['tracking', 'fishing', 'photo'],
};

const updatedUser = {
  username: 'Kostya',
  age: 36,
  hobbies: ['music', 'sex'],
};

describe('Test scenario #1', () => {

  let id: string = '';

  describe('GET /api/users - get all records', () => {

    test('should respond with empty array([]) and status code 200', async () => {
      const res = await request(server).get('/api/users');
      expect(res.body).toEqual([]);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /api/users - create new record', () => {
    test('should respond new record(object) with generated id(uuid) and status code 201', async () => {
      const user = {
        username: 'Vasya',
        age: 12,
        hobbies: ['tracking', 'fishing', 'photo']
      };

      const res = await request(server).post('/api/users').send(user);
      const { body } = res;

      id = body.id;

      expect(body).toEqual({ ...user, id: expect.any(String) });
      expect(res.statusCode).toBe(201);
    });
  });

  describe('GET /api/user/${userId} - try to get the created record by its id', () => {
    test('should respond a newly created record by id and status code 201', async () => {
      const { body: getBody, statusCode } = await request(server).get(`/api/users/${id}`);
      expect(getBody).toEqual({ ...user, id });
      expect(statusCode).toBe(200);
    });
  });

  describe('PUT /api/users/${userId} - try to update the created record', () => {
    test('should respond a updated record with the same id', async () => {
      const { body: putBody, statusCode } = await request(server).put(`/api/users/${id}`).send(updatedUser);
      expect(putBody).toEqual({ ...updatedUser, id });
      expect(statusCode).toBe(200);
    });
  });

  describe('DELETE /api/users/${userId} - try to update the created record', () => {
    test('should delete a record', async () => {
      const { body: deleteBody, statusCode } = await request(server).delete(`/api/users/${id}`);
      expect(deleteBody).toBe('');
      expect(statusCode).toBe(204);
    });
  });

  describe('GET /api/users/${userId} - try to get deleted record', () => {
    test('should respond an answer is that there is no such object', async () => {
      const { statusCode } = await request(server).get(`/api/users/${id}`);
      expect(statusCode).toBe(404);
    });
  });

});

describe('Test scenario #2', () => {

});
