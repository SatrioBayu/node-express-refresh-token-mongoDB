const userController = require("./userController");
const { User } = require("../models");
const mongoose = require("mongoose");

beforeAll(async () => {
  await mongoose.connect("mongodb://localhost:27017/learn-mongodb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await User.findOneAndUpdate({ username: "satrio" }, { username: "bayu" }, { collation: { locale: "en", strength: 2 } });
  await mongoose.disconnect();
});

describe("User Controller", () => {
  describe("Update Username", () => {
    it("should return 500 if there's error in try catch code", async () => {
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await userController.handleUpdateUsername(mockReq, mockRes);
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
    it("should return 403 if the user id in token didn't match with user id in query", async () => {
      const mockReq = {
        body: {
          username: "Cenah",
        },
        user: {
          id: "64645ad046304d62536a3c15",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await userController.handleUpdateUsername(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-012",
            message: "User from this token not found",
          },
        ],
      });
    });
    it("should return 409 if the new username is already registered", async () => {
      const mockReq = {
        body: {
          username: "rora",
        },
        user: {
          id: "64673884dd70d7c7ca4dc599",
        },
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await userController.handleUpdateUsername(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-014",
            message: "Username already in use",
          },
        ],
      });
    });
    it("should return 200 if the new username is the same as the old one", async () => {
      const mockReq = {
        body: {
          username: "Bayu",
        },
        user: {
          id: "64673884dd70d7c7ca4dc599",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await userController.handleUpdateUsername(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: "No operation was performed since the new username is the same as the old username",
      });
    });
    it("should return 200 if everything is OK", async () => {
      const mockReq = {
        body: {
          username: "Satrio",
        },
        user: {
          id: "64673884dd70d7c7ca4dc599",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await userController.handleUpdateUsername(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: "Username updated successfully",
      });
    });
  });

  describe("Update Password", () => {
    it("should return 500 if there's error in try catch code", async () => {
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await userController.handleUpdatePassword(mockReq, mockRes);
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
    it("should return 403 if the user id in token didn't match with user id in query", async () => {
      const mockReq = {
        body: {
          oldPassword: "123456",
          newPassword: "1234567",
        },
        user: {
          id: "64645ad046304d62536a3c15",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await userController.handleUpdatePassword(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-012",
            message: "User from this token not found",
          },
        ],
      });
    });
    it("should return 409 if the old password is wrong", async () => {
      const mockReq = {
        body: {
          oldPassword: "123456",
          newPassword: "1234567",
        },
        user: {
          id: "64673884dd70d7c7ca4dc599",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await userController.handleUpdatePassword(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.send).toHaveBeenCalledWith({
        errors: [
          {
            code: "E-013",
            message: "Old password is incorrect",
          },
        ],
      });
    });
    it("should return 200 if everything is OK", async () => {
      const mockReq = {
        body: {
          oldPassword: "12345678",
          newPassword: "12345678",
        },
        user: {
          id: "64673884dd70d7c7ca4dc599",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      await userController.handleUpdatePassword(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: "Password successfully updated",
      });
    });
  });
});
