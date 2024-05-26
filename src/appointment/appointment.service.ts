import * as PDFDocument from 'pdfkit';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
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
          date: dayjs(createAppointmentDto.date)
            .utc()
            .startOf('day')
            .toISOString(),
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
      return result;
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

  async generatePdf(cc: string): Promise<Buffer> {
    const appointments = await this.prisma.appointment.findMany({
      where: { cc },
    });

    const appointment = appointments[appointments.length - 1];

    if (!appointment) {
      throw new NotFoundException(
        'No se encontraron citas para el documento ${cc}',
      );
    }

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Uint8Array[] = [];

      doc.fontSize(18).text('Detalles de la Cita', { align: 'center' });
      doc.moveDown();

      if (!appointment) {
        doc
          .fontSize(14)
          .text(`No se encontraron citas para el documento ${cc}`);
        doc.end();
        return;
      }

      doc.fontSize(14).text(`ID de la cita: ${appointment.id}`);
      doc.moveDown();
      doc.fontSize(12).text(`CC: ${appointment.cc}`);
      doc.moveDown();
      doc.text(`Tipo de identificación: ${appointment.identification_type}`);
      doc.moveDown();
      doc.text(`Nombre: ${appointment.name}`);
      doc.moveDown();
      doc.text(`Apellido: ${appointment.last_name}`);
      doc.moveDown();
      doc.text(`Correo: ${appointment.email}`);
      doc.moveDown();
      doc.text(`Teléfono: ${appointment.phone}`);
      doc.moveDown();
      doc.text(`Fecha: ${new Date(appointment.date).toLocaleDateString()}`);
      doc.moveDown();
      doc.text(`Tipo de Consulta ID: ${appointment.typeOfConsultId}`);
      doc.moveDown();
      doc.text(`Hora ID: ${appointment.hourId}`);
      doc.end();

      doc.on('data', (chunk: Uint8Array) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      doc.on('error', (error) => {
        reject(error);
      });
    });
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
