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
			"/verify-email",
			emailVerificationLimit,
			this.userController.verifyEmailAddress
		);

		// User Registration
		this.router.post("/register/:token", this.userController.registerUser);
	}
}
