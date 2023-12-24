import { Router } from "express";
import UserController from "./user.controller";
import { verificationRequestLimit } from "../../config/core/services/verificationRequestLimit";

export default class UserRoutes {
  private router = Router();
  private userController: UserController = new UserController();

  constructor() {
    this.initRoutes();
  }

  private initRoutes(): void {
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
      "/forget-password",
      verificationRequestLimit,
      this.userController.forgetPassword
    );

    // Reset Password
    this.router.put("/reset-password", this.userController.resetPassword);

    //Change Password
    this.router.post("/change-password", this.userController.changePassword);
  }
}
