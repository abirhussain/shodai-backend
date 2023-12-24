import rateLimit from "express-rate-limit";

//limit email verification and forget password
const minutes = 30;
export const emailVerificationLimit = rateLimit({
	windowMs: minutes * 60 * 1000,
	max: 3,
	handler: (req, res) => {
		res.status(429).send({
			success: false,
			message: `You made too many requests. Please try again after ${minutes} minutes.`,
		});
	},
});
