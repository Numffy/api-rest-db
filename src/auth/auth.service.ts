import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { compareHash } from 'src/common/utils/passHash';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  register(createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Email is wrogn');

    const isPassowordValid = await compareHash(password, user.password);
    if (!isPassowordValid)
      throw new UnauthorizedException('Passoword Incorrect');

    const payload = { email: user.email, roleId: user.roleId };

    const token = await this.jwtService.signAsync(payload);

    return {
      email,
      token,
    };
  }

  async profile({ email, roleId }: { email: string; roleId: string }) {
    return await this.userService.findOneByEmail(email);
  }
}
