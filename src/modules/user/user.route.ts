import { Router } from "express";
import UserController from "./user.controller";
import { emailVerificationLimit } from "../../config/core/services/emailVerificationLimit";

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
			emailVerificationLimit,
			this.userController.verifyEmailAddress
		);

		// User Registration
		this.router.post("/users/register/:token", this.userController.registerUser);

		//user signin
		this.router.post('/users/signin', this.userController.loginUser);
	}
}
