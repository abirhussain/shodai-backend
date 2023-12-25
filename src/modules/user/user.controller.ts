import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import User from "./user.model";
import { DeleteUserRequest } from "../../config/core/interfaces/user.interfaces";
import UserDoc from "../../config/core/interfaces/userDoc";
import { EmailOptions } from "../../config/core/interfaces/emailOptions.interface";
import {
  tokenForVerify,
  sendEmail,
  signInToken,
} from "../../config/core/services/auth";

export default class UserController {
  public async verifyEmailAddress(req: Request, res: Response): Promise<void> {
    const email: string = req.body.email;
    const name: string = req.body.name;

    try {
      const isEmailExist = await User.findOne({ email });

      if (isEmailExist) {
        res.status(403).send({
          message: "Email Already Exist!!!",
        });
      }
      const user = req.body;
      const token: string = tokenForVerify(user);
      const mailOptions: EmailOptions = {
        from: {
          name: "Shodai",
          address: process.env.SENDER_EMAIL as string,
        },
        to: email,
        subject: "Verify Your Email",
        html: `<h2>Hello ${name}</h2>
                  <!-- Email verification content -->
                  <!-- Link to activate the account -->
                  <a href=${process.env.FRONTEND_BASE_URL}/user/email-verification/${token} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Account</a>
                  <!-- Additional message and signature -->
                  <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@shodai.com</p>
                  <p style="margin-bottom:0px;">Thank you</p>
                  <strong>Shodai Team</strong>
                     `,
      };
      const message = "Please check your email to verify!";
      sendEmail(mailOptions, res, message);
    } catch (err: any) {
      res.status(500).send({
        message: err.message,
      });
    }
  }

  public async registerUser(req: Request, res: Response): Promise<void> {
    const token: string = req.params.token;

    try {
      const decodedToken: any = jwt.decode(token);
      const { name, email, password } = decodedToken;

      const existingUser: UserDoc | null = await User.findOne({ email });

      if (existingUser) {
        const existingUserToken = signInToken(existingUser);
        res.send({
          token: existingUserToken,
          name: existingUser.name,
          email: existingUser.email,
          message: "Email Already Verified!!!",
        });
      }

      if (token) {
        jwt.verify(
          token,
          process.env.JWT_SECRET_FOR_VERIFICATION || "",
          async (err: jwt.VerifyErrors | null, decoded: any) => {
            if (err) {
              return res.status(401).send({
                message: "Token Expired, Please try again!",
              });
            } else {
              const newUser = new User({
                name,
                email,
                password,
              });

              await newUser.save();

              const newUserToken = signInToken(newUser);

              res.send({
                token: newUserToken,
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                message: "Email Verified, Please Login Now!",
              });
            }
          }
        );
      }
    } catch (err: any) {
      res.status(500).send({
        message: err.message,
      });
    }
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const email: string = req.body.email;
      const password: string = req.body.password;

      const user: UserDoc | null = await User.findOne(
        { email },
        { __v: 0, updatedAt: 0, createdAt: 0 }
      );

      if (user) {
        const decryptedPassword = CryptoJS.AES.decrypt(
          user.password,
          process.env.CRYPTO_SECRET as string
        );

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
      } else {
        res.status(401).send({ message: "Invalid Credentials" });
      }
    } catch (err: any) {
      res.status(500).send({
        message: err.message,
      });
    }
  }

  public async forgetPassword(req: Request, res: Response): Promise<void> {
    const email: string = req.body.email;

    try {
      const user: UserDoc | null = await User.findOne(
        { email },
        { __v: 0, updatedAt: 0, createdAt: 0 }
      );

      if (!user) {
        res.status(404).send({
          message: "User doesn't exist",
        });
      } else {
        const token: string = tokenForVerify(user);

        const mailOptions = {
          from: {
            name: "Shodai",
            address: process.env.SENDER_EMAIL as string,
          },
          to: email,
          subject: "Password Reset",
          html: `<h2>Hello ${user.name.toUpperCase()}</h2>
          <p>A request has been received to change the password for your <strong>Shodai</strong> account </p>

          <p>This link will expire in <strong> 15 minutes</strong>.</p>

          <p style="margin-bottom:20px;">Click this link to reset password</p>

          <a href=${process.env.FRONTEND_BASE_URL
            }/user/forget-password/${token} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Reset Password</a>

          <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@shodai.com</p>

          <p style="margin-bottom:0px;">Thank you</p>
          <strong>Shodai Team</strong>
             `,
        };

        const message = "A password reset link has been sent to your email !!!";
        sendEmail(mailOptions, res, message);
      }
    } catch (err: any) {
      res.status(500).send({
        message: err.message,
      });
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const token: string | undefined = req.body.token;
      const newPassword: string | undefined = req.body.password;

      if (token) {
        jwt.verify(
          token,
          process.env.JWT_SECRET_FOR_VERIFICATION as string,
          async (err: jwt.VerifyErrors | null, decoded: any) => {
            if (err) {
              return res.status(401).send({
                message: "Token expired, please try again !!!",
              });
            } else {
              const decodedToken: any = jwt.decode(token);
              const { email } = decodedToken;
              const user: UserDoc | null = await User.findOne(
                { email },
                { __v: 0, updatedAt: 0, createdAt: 0 }
              );

              if (user) {
                user.password = newPassword as string;
                await user.save();

                res.status(200).send({
                  message: "Password has been changed successfully !!!",
                });
              } else {
                return res.status(404).send({
                  message: "User doesn't exist",
                });
              }
            }
          }
        );
      } else {
        res.status(401).send({
          message: "Token is missing !!!",
        });
      }
    } catch (err: any) {
      res.status(500).send({ message: err.message });
    }
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const email: string = req.body.email;
      const oldPwd: string = req.body.oldPwd;
      const newPwd: string = req.body.newPwd;

      const user: UserDoc | null = await User.findOne(
        { email },
        { __v: 0, updatedAt: 0, createdAt: 0 }
      );

      if (user) {
        const decryptedPassword = CryptoJS.AES.decrypt(
          user.password,
          process.env.CRYPTO_SECRET as string
        );

        if (decryptedPassword.toString(CryptoJS.enc.Utf8) !== oldPwd) {
          res.status(401).send({ message: "Invalid Credentials" });
        } else {
          user.password = newPwd;
          await user.save();

          res.status(200).send({
            message: "The password or passphrase is changed.!!!",
          });
        }
      } else {
        res.status(500).send({
          message:
            "Change password failed !!! Check whether the user ID and oldPwd you provide are correct.",
        });
      }
    } catch (err: any) {
      res.status(500).send({
        message: err.message,
      });
    }
  }

  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users: UserDoc[] = await User.find({}, { password: 0 });
      res.status(200).send(users);
    } catch (err: any) {
      res.status(500).send({ message: err.message });
    }
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const _id = req.params.id;
      const user: UserDoc | null = await User.findById(_id);

      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send({ message: "User not found !!!" });
      }
    } catch (err: any) {
      res.status(500).send({
        message: err.message,
      });
    }
  }

  public async updateUserInfo(req: Request, res: Response): Promise<void> {
    try {
      const _id = req.params.id;
      const user: UserDoc | null = await User.findById(_id);

      if (user) {
        const name = req.body.name ?? user.name;
        const image = req.body.image ?? user.image;
        const phone = req.body.phone ?? user.phone;
        const address = req.body.address ?? user.address;

        const updatedUser: UserDoc | null = await User.findOneAndUpdate(
          { _id },
          { $set: { name, image, phone, address } },
          { new: true }
        );

        if (updatedUser) {
          const token = signInToken(updatedUser);
          res.send({
            token,
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            address: updatedUser.address,
            phone: updatedUser.phone,
            image: updatedUser.image,
          });
        } else {
          res.status(500).send({
            message: "User Info Couldn't Update !!!",
          });
        }
      } else {
        res.status(401).send({
          message: "Unauthorized Access !!!",
        });
      }
    } catch (err: any) {
      res.status(500).send({
        message: err.message,
      });
    }
  }

  public async deleteUser(
    req: DeleteUserRequest,
    res: Response
  ): Promise<void> {
    try {
      const result = await User.deleteOne({ _id: req.params.id });

      if (result.deletedCount === 0) {
        res.status(404).send({
          message: "User not found",
        });
      } else {
        res.status(200).send({
          message: "User Deleted Successfully!",
        });
      }
    } catch (err: any) {
      res.status(500).send({
        message: err.message,
      });
    }
  }
}
