import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
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

  @IsString()
  phone: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  typeOfConsultId: string;

  @IsString()
  hourId: string;
}
