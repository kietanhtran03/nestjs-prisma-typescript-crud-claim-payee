import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './dto/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { DatabaseService } from 'src/database/database.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const rawExpiresIn =
          configService.get<string>('JWT_EXPIRES_IN') ?? '1d';

        const expiresIn = /^\d+$/.test(rawExpiresIn)
          ? Number(rawExpiresIn)
          : (rawExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`);

        return {
          secret: configService.get<string>('JWT_SECRET') ?? 'default-secret',
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, DatabaseService, JwtStrategy],
})
export class AuthModule {}
