import { Types } from "mongoose";

export default interface User {
	_id?: Types.ObjectId;
	name: string;
	email: string;
	password: string;
	address?: string;
	phone?: string;
	image?: string;
}
