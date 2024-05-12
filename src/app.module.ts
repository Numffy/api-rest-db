import { Module } from '@nestjs/common';
import { AppointmentModule } from './appointment/appointment.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AppointmentModule, UserModule, AuthModule, ConfigModule.forRoot()],
  providers: [],
})
export class AppModule {}
