const authenticationController = require("./authenticationController");
const User = require("../models/userModel");
const mongoose = require("mongoose");

describe("authenticationController", () => {
  describe("registerUser", () => {
    beforeAll(async () => {
      await mongoose.connect("mongodb://localhost:27017/your-database", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });

    // Close the connection to the database after the tests have finished
    afterAll(async () => {
      await mongoose.disconnect();
    });

    it("should return 400 if the body is empty", () => {
      const mockReq = {
        body: {},
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      authenticationController.handleRegister(mockReq, mockRes, () => {
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({
          errors: [
            {
              code: "E-001",
              message: "Please provide a username and password",
            },
          ],
        });
        done();
      });
    });
    it("should return 409 if the username already exists", () => {
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

      authenticationController.handleRegister(mockReq, mockRes, () => {
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
    });
  });
});
