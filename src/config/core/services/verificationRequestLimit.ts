import { Request, Response } from "express";
import rateLimit from "express-rate-limit";

//limit email verification and forget password request
const minutes = 15;
export const verificationRequestLimit = rateLimit({
	windowMs: minutes * 60 * 1000,
	max: 3,
	handler: (req: Request, res: Response) => {
		res.status(429).send({
			success: false,
			message: `You made too many requests. Please try again after ${minutes} minutes.`,
		});
	},
});
