import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import User from "../interfaces/user";
import { Response } from "express";
import { EmailOptions } from "../interfaces/emailOptions.interface";

export const tokenForVerify = (user: User) => {
	return jwt.sign(
		{
			name: user.name,
			email: user.email,
			password: user.password,
		},
		process.env.JWT_SECRET_FOR_VERIFICATION || "",
		{ expiresIn: "15m" }
	);
};

export const sendEmail = async (mailOptions: EmailOptions, res: Response, message: string) => {
	const transporter = nodemailer.createTransport({
		host: process.env.HOST,
		service: process.env.SERVICE, //comment this line if you use custom server/domain
		port: Number(process.env.EMAIL_PORT),
		auth: {
			user: process.env.SENDER_EMAIL,
			pass: process.env.APP_PASS,
		},
	});

	try {
		await transporter.sendMail(mailOptions);
		res.send({
			message: message,
		});
	} catch (err: any) {
		res.status(403).send({
			message: `Error happen when sending email ${err.message}`,
		});
	}
};

export const signInToken = (user: User) => {
	return jwt.sign(
		{
			_id: user._id,
			name: user.name,
			email: user.email,
			address: user.address,
			phone: user.phone,
			image: user.image,
		},
		process.env.JWT_SECRET || "",
		{
			expiresIn: "2d",
		}
	);
};
