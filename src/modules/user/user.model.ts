import mongoose, { Schema } from "mongoose";
import UserDoc from "../../config/core/interfaces/userDoc";
import CryptoJS from "crypto-js";

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		phone: {
			type: String,
			required: false,
		},
		address: {
			type: String,
			required: false,
		},
		city: {
			type: String,
			required: false,
		},
		country: {
			type: String,
			required: false,
		},
		password: {
			type: String,
			required: false,
		},
		image: {
			type: String,
			required: false,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.path("email").validate(async (email: String) => {
	let emailCount = await mongoose.models.User.countDocuments({ email });
	return !emailCount;
}, "User already exist");

userSchema.pre("save", async function (this: UserDoc, next: Function) {
	try {
		(this.password = CryptoJS.AES.encrypt(
			this.password,
			process.env.CRYPTO_SECRET || ""
		).toString()),
			next();
	} catch (err) {
		console.log(err);
	}
});

export default mongoose.model<UserDoc>("User", userSchema);
