import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ Torna o config acessível em todo o app
    }),
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') || 'default-secret';
        const expiresInEnv = configService.get<string>('JWT_EXPIRES_IN') || '86400'; // 1 dia
        const expiresIn = parseInt(expiresInEnv, 10); // ✅ converte para número

        console.log('🔑 JWT Secret usado para ASSINAR:', secret);
        console.log('⏳ Token expira em segundos:', expiresIn);

        return {
          secret,
          signOptions: { expiresIn }, // agora é number → sem erro
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}


