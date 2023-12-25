import express, { Router } from "express";
import UserController from "./user.controller";
import { verificationRequestLimit } from "../../config/core/services/verificationRequestLimit";

class UserRoutes {
  public router: Router;
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
    this.router = express.Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    //Email Verification
    this.router.post(
      "/users/verify-email",
      verificationRequestLimit,
      this.userController.verifyEmailAddress
    );

    // User Registration
    this.router.post(
      "/users/register/:token",
      this.userController.registerUser
    );

    //user signin
    this.router.post("/users/signin", this.userController.loginUser);

    //forget-password
    this.router.put(
      "/users/forget-password",
      verificationRequestLimit,
      this.userController.forgetPassword
    );

    // Reset Password
    this.router.put("/users/reset-password", this.userController.resetPassword);

    //Change Password
    this.router.post(
      "/users/change-password",
      this.userController.changePassword
    );

    //Get All Users
    this.router.get("/users", this.userController.getAllUsers);

    //Find User By User ID
    this.router.get("/:id", this.userController.getUserById);

    //update a user
    this.router.patch("/:id", this.userController.updateUserInfo);

    //delete a user
    this.router.delete("/:id", this.userController.deleteUser);
  }
}

export default UserRoutes;
