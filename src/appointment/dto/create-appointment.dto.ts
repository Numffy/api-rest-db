import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  cc: string

  @IsString()
  identification_type: string;

  @IsString()
  name: string;

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
  typeOfConsultId:string;

  
}
