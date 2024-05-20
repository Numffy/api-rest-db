import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PrismaService } from 'src/libs/prisma/prisma.service';
dayjs.extend(utc);

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger('AppointmentService');

  async create(createAppointmentDto: CreateAppointmentDto) {
    try {
      return await this.prisma.appointment.create({
        data: {
          ...createAppointmentDto,
          date: dayjs(createAppointmentDto.date).utc().startOf('day').toISOString()
        },
      });
    } catch (error) {
      this.handlerDbError(error);
      throw new BadRequestException('Internal Server Error, Check Logs');
    }
  }

  findAll() {
    return this.prisma.appointment.findMany();
  }

  async findOne(id: string) {
    const exists = await this.prisma.appointment.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Appointment Not Found');
    return exists;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    await this.findOne(id);
    try {
      const result = await this.prisma.appointment.update({
        where: { id },
        data: updateAppointmentDto,
      });
    } catch (error) {
      this.handlerDbError(error);
      throw new BadRequestException('Internal Server Error, Check Logs');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.appointment.delete({ where: { id } });
      return 'User has been deleted succefully';
    } catch (error) {
      this.logger.error(error);
    }
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
