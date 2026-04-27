import { UsersService } from '@/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findOne(signInDto.email);
    if (!user || user?.password != signInDto.password) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
