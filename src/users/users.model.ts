import { Prisma } from "generated/prisma";


export class User implements Prisma.UserCreateInput{
     name: string;
     password: string;
     username: string;
     email: string;
}