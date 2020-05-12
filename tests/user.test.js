const request = require("supertest");
const HttpStatus = require("http-status-codes");
const app = require("../src/app");
const { User } = require("../src/models");
const { userOneId, userOne, userOneToken, setupDatabase } = require("./fixtures/db");

const endpointUrl = "/users";

beforeEach(setupDatabase);

test("Should sign up a new user", async () => {
  const requestUser = {
    name: "Fernando Alegria",
    email: "fernanalegria@gmail.com",
    password: "'tEfn2QEN8MM]/*]"
  };
  const { name, email, password } = requestUser;
  const response = await request(app)
    .post(endpointUrl)
    .send(requestUser)
    .expect(HttpStatus.CREATED);

  const dbUser = await User.findById(response.body.user._id);
  expect(dbUser).not.toBeNull();
  expect(dbUser.password).not.toBe(password);

  expect(response.body).toMatchObject({
    user: {
      name,
      email
    },
    token: dbUser.tokens[0].token
  });
});

test("Should log in an existing user", async () => {
  const { email, password } = userOne;
  const response = await request(app)
    .post(`${endpointUrl}/login`)
    .send({
      email,
      password
    })
    .expect(HttpStatus.OK);

  const dbUser = await User.findById(userOneId);
  expect(dbUser).not.toBeNull();
  expect(response.body).toMatchObject({
    user: {
      _id: userOneId,
      email
    },
    token: dbUser.tokens[1].token
  });
});

test("Should not log in a non-existing user", async () => {
  const { email } = userOne;
  await request(app)
    .post(`${endpointUrl}/login`)
    .send({
      email,
      password: "=hN2w,?Cx}{gNQYP"
    })
    .expect(HttpStatus.BAD_REQUEST);
});

test("Should get user profile", async () => {
  await request(app)
    .get(`${endpointUrl}/me`)
    .set("Authorization", `Bearer ${userOneToken}`)
    .send()
    .expect(HttpStatus.OK);
});

test("Should not get unauthenticated user profile", async () => {
  await request(app)
    .get(`${endpointUrl}/me`)
    .send()
    .expect(HttpStatus.UNAUTHORIZED);
});

test("Should delete user account", async () => {
  await request(app)
    .delete(`${endpointUrl}/me`)
    .set("Authorization", `Bearer ${userOneToken}`)
    .send()
    .expect(HttpStatus.NO_CONTENT);

  const dbUser = await User.findById(userOneId);
  expect(dbUser).toBeNull();
});

test("Should not delete unauthenticated user account", async () => {
  await request(app)
    .delete(`${endpointUrl}/me`)
    .send()
    .expect(HttpStatus.UNAUTHORIZED);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post(`${endpointUrl}/me/avatar`)
    .set("Authorization", `Bearer ${userOneToken}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(HttpStatus.OK);

  const dbUser = await User.findById(userOneId);
  expect(dbUser.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
  const name = "Ben";
  const response = await request(app)
    .patch(`${endpointUrl}/me`)
    .set("Authorization", `Bearer ${userOneToken}`)
    .send({
      name
    })
    .expect(HttpStatus.OK);

  expect(response.body).toMatchObject({
    _id: userOneId,
    name
  });

  const dbUser = await User.findById(userOneId);
  expect(dbUser).not.toBeNull();
  expect(dbUser.name).toBe(name);
});

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch(`${endpointUrl}/me`)
    .set("Authorization", `Bearer ${userOneToken}`)
    .send({
      location: "Zürich"
    })
    .expect(HttpStatus.BAD_REQUEST);
});
