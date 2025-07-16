import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { User, UserDocument } from './schemas/user.schema.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserLoginDto } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: UserRegisterDto) {
    const { email, password, name, username } = registerDto;
    if (await this.userModel.findOne({ email })) {
      throw new BadRequestException('Email already exists');
    }
    if (await this.userModel.findOne({ username })) {
      throw new BadRequestException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      username,
    });
    const savedUser = await user.save();
    const payload = {
      sub: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      username: savedUser.username,
    };
    const token = this.jwtService.sign(payload);
    return { message: 'User registered successfully', user: savedUser, token };
  }

  async login(loginDto: UserLoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
      username: user.username,
    };
    const token = this.jwtService.sign(payload);
    return { message: 'User logged in successfully', user, token };
  }
}
