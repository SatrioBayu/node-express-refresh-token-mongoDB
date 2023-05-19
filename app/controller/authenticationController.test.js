const authenticationController = require("./authenticationController");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

beforeAll(async () => {
  await mongoose.connect("mongodb://localhost:27017/learn-mongodb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Close the connection to the database after the tests have finished
afterAll(async () => {
  await User.findOneAndDelete({ username: "jabran" }, { collation: { locale: "en", strength: 2 } });
  await mongoose.disconnect();
});

describe("authenticationController", () => {
  describe("authenticationAndAuthorization", () => {
    it("should return 500 if there's error in try catch code", async () => {
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await authenticationController.handleAuth(mockReq, mockRes, next);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-007",
            message: expect.any(String),
          },
        ],
      });
    });
    it("should return 401 if there's no token", async () => {
      const mockReq = {
        headers: {},
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();
      await authenticationController.handleAuth(mockReq, mockRes, next);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-008",
            message: "No token provided",
          },
        ],
      });
    });
    it("should return 403 if the token is valid but already blacklisted", async () => {
      const mockReq = {
        headers: {
          authorization: "Bearer valid",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();
      await authenticationController.handleAuth(mockReq, mockRes, next);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-009",
            message: "Token blacklisted",
          },
        ],
      });
    });
    it("should return 403 if the token is invalid", async () => {
      const mockReq = {
        headers: {
          authorization: "Bearer invalid",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();
      await authenticationController.handleAuth(mockReq, mockRes, next);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-010",
            message: expect.any(String),
          },
        ],
      });
    });
    it("should return 403 if the token is valid but not the right user", async () => {
      const token = jwt.sign({ id: "64645ad046304d62536a3c15" }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: "10s" });
      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();
      await authenticationController.handleAuth(mockReq, mockRes, next);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-011",
            message: expect.any(String),
          },
        ],
      });
    });
    it("should return next if there is no error", async () => {
      const token = jwt.sign({ id: "64645ad046304d62536a3c16" }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: "10s" });
      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();
      await authenticationController.handleAuth(mockReq, mockRes, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("registerUser", () => {
    it("should return 500 if there's error in try catch code", async () => {
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await authenticationController.handleRegister(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-007",
            message: expect.any(String),
          },
        ],
      });
    });
    it("should return 400 if the body is empty", async () => {
      const mockReq = {
        body: {},
      };
      const errors = validationResult(mockReq);
      const errorArray = errors.array().map((err) => {
        return { code: err.msg, message: err.msg };
      });

      if (!errors.isEmpty()) {
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn().mockReturnThis(),
        };
        await authenticationController.handleLogin(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
          errors: errorArray,
        });
      }
    });
    it("should return 409 if the username already exists", async () => {
      const mockReq = {
        body: {
          username: "bayu",
          password: "password",
        },
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await authenticationController.handleRegister(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-004",
            message: "Username already exist",
          },
        ],
      });
    });
    it("should return 200 if everything is OK", async () => {
      const mockReq = {
        body: {
          username: "Jabran",
          password: "password",
        },
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await authenticationController.handleRegister(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: "User registered successfully",
        user: expect.any(Object),
      });
    });
  });

  describe("loginUser", () => {
    it("should return 500 if there's error in try catch code", async () => {
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await authenticationController.handleLogin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-007",
            message: expect.any(String),
          },
        ],
      });
    });
    it("should return 400 if the body is empty", async () => {
      const mockReq = {
        body: {},
      };

      const errors = validationResult(mockReq);
      const errorArray = errors.array().map((err) => {
        return { code: err.msg, message: err.msg };
      });

      if (!errors.isEmpty()) {
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn().mockReturnThis(),
        };
        await authenticationController.handleLogin(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
          errors: errorArray,
        });
      }
    });
    it("should return 401 if the password is incorrect", async () => {
      const mockReq = {
        body: {
          username: "bayu",
          password: "password",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await authenticationController.handleLogin(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-005",
            message: "Invalid username or password",
          },
        ],
      });
    });
    it("should return 401 if the username is incorrect", async () => {
      const mockReq = {
        body: {
          username: "bambang",
          password: "password",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await authenticationController.handleLogin(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-005",
            message: "Invalid username or password",
          },
        ],
      });
    });
    it("should return 403 if the user is already logged in", async () => {
      const mockReq = {
        body: {
          username: "Jabran",
          password: "password",
        },
        cookies: {
          refreshToken: "123",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await authenticationController.handleLogin(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-006",
            message: "Already login",
          },
        ],
      });
    });
    it("should return 200 if everything is OK", async () => {
      const mockReq = {
        body: {
          username: "Jabran",
          password: "password",
        },
        cookies: {},
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        cookie: jest.fn(),
      };
      await authenticationController.handleLogin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        accessToken: expect.any(String),
      });
    });
  });
});
