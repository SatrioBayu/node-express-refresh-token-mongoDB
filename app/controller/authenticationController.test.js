const authenticationController = require("./authenticationController");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

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
            code: "E-003",
            message: "Something went wrong",
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
            code: "E-002",
            message: "Username already exists",
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
            code: "E-003",
            message: "Something went wrong",
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
            code: "E-004",
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
            code: "E-004",
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
            code: "E-005",
            message: "You are already logged in",
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
