import { Request } from 'express';


export interface DeleteUserRequest extends Request {
  params: {
    id: string;
  };
}

