/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString } from 'class-validator';

export class UserLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
