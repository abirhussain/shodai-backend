import mongoose from "mongoose";

export default interface UserDoc extends mongoose.Document {
	name: string;
	email: string;
	password: string;
	phone: string;
	address: string;
	city: string;
	country: string;
	image: string;
	timestamp: Date;
}

