import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import User from "./user.model";

import {
	tokenForVerify,
	sendEmail,
	signInToken,
} from "../../config/core/services/auth";

export default class UserController {
	public async verifyEmailAddress(req: Request, res: Response) {
		const email = req.body.email;
		const name = req.body.name;
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
					name: "Shodai",
					address: process.env.SENDER_EMAIL,
				},
				to: `${email}`,
				subject: "Verify Your Email",
				html: `<h2>Hello ${name}</h2>
            <p>Verify your email address to complete the signup and login into your <strong>SHODAI</strong> account.</p>
      
              <p>This link will expire in <strong> 15 minute</strong>.</p>
      
              <p style="margin-bottom:20px;">Click this link for active your account</p>
      
              <a href=${process.env.FRONTEND_BASE_URL}/user/email-verification/${token} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Account</a>
      
              <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@shodai.com</p>
      
              <p style="margin-bottom:0px;">Thank you</p>
              <strong>Shodai Team</strong>
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
				process.env.JWT_SECRET_FOR_VERIFICATION || "",
				(err: any, decoded: any) => {
					if (err) {
						return res.status(401).send({
							message: "Token Expired, Please try again!",
						});
					} else {
						const newUser = new User({
							name,
							email,
							password
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

	public async loginUser(req: Request, res: Response) {
		try {
			const email = req.body.email;
			const password = req.body.password;
			const user = await User.findOne({ email }, { __v: 0, updatedAt: 0, createdAt: 0 });

			if (user) {
				const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.CRYPTO_SECRET || "");
				if (decryptedPassword.toString(CryptoJS.enc.Utf8) !== password) {
					res.status(401).send({ message: "Invalid Credentials" });
				} else {
					const token = signInToken(user);
					res.send({
						token,
						_id: user._id,
						name: user.name,
						email: user.email,
						address: user.address,
						phone: user.phone,
						image: user.image,
					});
				}
			}
		} catch (err: any) {
			res.status(500).send({
				message: err.message,
			});
		}
	};

	public async forgetPassword(req: Request, res: Response) {
		const email = req.body.email
		const user = await User.findOne({ email }, { __v: 0, updatedAt: 0, createdAt: 0 });
		if (!user) {
			return res.status(404).send({
				message: "User doesn't exist",
			});
		} else {
			const token = tokenForVerify(user);
			const mailOptions = {
				from: process.env.SENDER_EMAIL,
				to: `${email}`,
				subject: 'Password Reset',
				html: `<h2>Hello ${user.name.toUpperCase()}</h2>
			<p>A request has been received to change the password for your <strong>Shodai</strong> account </p>

			  <p>This link will expire in <strong> 15 minutes</strong>.</p>

			  <p style="margin-bottom:20px;">Click this link to reset password</p>
	  
			  <a href=${process.env.FRONTEND_BASE_URL}/user/forget-password/${token} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Reset Password</a>
	  
			  <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@shodai.com</p>
	  
			  <p style="margin-bottom:0px;">Thank you</p>
			  <strong>Shodai Team</strong>
				   `,
			};

			const message = 'A passwork reset link has been sent to your email !!!';
			sendEmail(mailOptions, res, message);
		}
	};

	public async resetPassword(req: Request, res: Response) {
		const token = req.body.token;
		const newPassword = req.body.password;
		if (token) {
			jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFICATION || "", async (err: any, decoded: any) => {
				if (err) {
					return res.status(401).send({
						message: 'Token expired, please try again !!!',
					});
				} else {
					const decodedToken: any = jwt.decode(token);
					const { email } = decodedToken;
					const user = await User.findOne({ email }, { __v: 0, updatedAt: 0, createdAt: 0 });
					if (user) {
						user.password = newPassword;
						user.save();
						res.status(200).send({
							message: 'Password has been changed successfully !!!',
						});
					} else {
						return res.status(404).send({
							message: "User doesn't exist",
						});
					}

				}
			});
		} else {
			res.status(401).send({
				message: "Token is missing !!!"
			})
		}
	};
}
