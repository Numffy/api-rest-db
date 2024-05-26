import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { passHash } from 'src/common/utils/passHash';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  private logger = new Logger('UserService');
  async create({ cc, email, password, name, last_name }: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          cc: cc,
          email: email,
          password: await passHash(password),
          name: name,
          last_name: last_name,
          roleId: '1',
        },
        select: {
          cc: true,
          email: true,
          password: false,
          name: true,
          last_name: true,
          roleId: false,
          appointments: false,
        },
      });
    } catch (error) {
      this.handlerDbError(error);
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        select: {
          cc: true,
          email: true,
          name: true,
          last_name: true,
          roleId: true,
          appointments: true,
          role: false,
          _count: true,
        },
      });
    } catch (error) {
      this.handlerDbError(error);
    }
  }

  async findOne(id: string) {
    const exists = await this.prisma.user.findUnique({ where: { cc: id } });
    if (!exists) throw new NotFoundException(`User With id: ${id} Not Found`);
    return exists;
  }

  async findOneByEmail(email: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (!exists) throw new NotFoundException('User Not Found');
    return exists;
  }

  async update(
    id: string,
    { cc, email, password, name, last_name }: UpdateUserDto,
  ) {
    await this.findOne(id);
    try {
      return await this.prisma.user.update({
        where: { cc: id },
        data: {
          cc: cc,
          email: email,
          password: await passHash(password),
          name: name,
          last_name: last_name,
        },
      });
    } catch (error) {
      this.handlerDbError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    this.prisma.user.delete({ where: { cc: id } });
    return { message: 'user has beend deleted succesfully' };
  }

  private handlerDbError(error: any) {
    if (error.code === 'P2002') {
      throw new BadRequestException({
        error: `the ${error.meta.target} field is expected to be unique`,
        detail: error.meta,
      });
    }
    if (error.code === 'P2003') {
      throw new BadRequestException({
        error: `constraint violation`,
        datail: error.meta,
      });
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Internal Server Error, Check the logs for more information',
    );
  }
}
