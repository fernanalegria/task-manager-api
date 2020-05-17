const request = require('supertest');
const HttpStatus = require('http-status-codes');
const app = require('../src/app');
const { Task } = require('../src/models');
const {
  userOneId,
  userOneToken,
  userTwoToken,
  taskOneId,
  setupDatabase
} = require('./fixtures/db');

const endpointUrl = '/tasks';

beforeEach(setupDatabase);

test('Should create task for user', async () => {
  const requestTask = {
    description: 'Do something'
  };
  const response = await request(app)
    .post(endpointUrl)
    .set('Authorization', `Bearer ${userOneToken}`)
    .send(requestTask)
    .expect(HttpStatus.CREATED);

  expect(response.body).toMatchObject({
    ...requestTask,
    completed: false,
    owner: userOneId
  });

  const dbTask = await Task.findById(response.body._id);
  expect(dbTask).not.toBeNull();
});

test('Should fetch user tasks', async () => {
  const response = await request(app)
    .get(endpointUrl)
    .set('Authorization', `Bearer ${userOneToken}`)
    .send()
    .expect(HttpStatus.OK);

  expect(response.body).toHaveLength(2);
});

test('Should not delete other users tasks', async () => {
  await request(app)
    .delete(`${endpointUrl}/${taskOneId}`)
    .set('Authorization', `Bearer ${userTwoToken}`)
    .send()
    .expect(HttpStatus.NOT_FOUND);

  const dbTask = Task.findById(taskOneId);
  expect(dbTask).not.toBeNull();
});
