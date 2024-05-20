import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  cc: string;

  @IsString()
  identification_type: string;

  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsString()
  last_name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsNumber()
  phone: number;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  typeOfConsultId: string;

  @IsString()
  @MaxLength(30)
  hour: string;
}
