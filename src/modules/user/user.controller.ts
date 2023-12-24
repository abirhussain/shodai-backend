import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "./user.model";

import {
	tokenForVerify,
	sendEmail,
	signInToken,
} from "../../config/core/services/auth";

export default class UserController {
	public async verifyEmailAddress(req: Request, res: Response) {
		const email = req.body.email;
		const isEmailExist = await User.findOne({ email });
		if (isEmailExist) {
			return res.status(403).send({
				message: "Email Already Exist!!!",
			});
		} else {
			const user = req.body;
			const token = tokenForVerify(user);
			const mailOptions = {
				from: {
					name: "Amana Big Bazar",
					address: process.env.SENDER_EMAIL,
				},
				to: `${email}`,
				subject: "Verify Your Email",
				html: `<h2>Hello ${email}</h2>
            <p>Verify your email address to complete the signup and login into your <strong>AmanaBigBazar</strong> account.</p>
      
              <p>This link will expire in <strong> 15 minute</strong>.</p>
      
              <p style="margin-bottom:20px;">Click this link for active your account</p>
      
              <a href=${process.env.STORE_URL}/user/email-verification/${token} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Account</a>
      
              <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@abb.com</p>
      
              <p style="margin-bottom:0px;">Thank you</p>
              <strong>Amana Big Bazar Team</strong>
                   `,
			};

			const message = "Please check your email to verify!";
			sendEmail(mailOptions, res, message);
		}
	}

	public async registerUser(req: Request, res: Response) {
		const token: string = req.params.token;
		const decodedToken: any = jwt.decode(token);
		const { name, email, password } = decodedToken;
		const user = await User.findOne({ email });
		if (user) {
			const token = signInToken(user);
			return res.send({
				token,
				name: user.name,
				email: user.email,
				message: "Email Already Verified!!!",
			});
		}

		if (token) {
			jwt.verify(
				token,
				process.env.JWT_SECRET_FOR_EMAIL_VERIFICATION || "",
				(err: any, decoded: any) => {
					if (err) {
						return res.status(401).send({
							message: "Token Expired, Please try again!",
						});
					} else {
						const newUser = new User({
							name,
							email,
							password: CryptoJS.AES.encrypt(
								password,
								process.env.CRYPTO_SECRET || ""
							).toString(),
						});
						newUser.save();
						const token = signInToken(newUser);
						res.send({
							token,
							_id: newUser._id,
							name: newUser.name,
							email: newUser.email,
							message: "Email Verified, Please Login Now!",
						});
					}
				}
			);
		}
	}
}
