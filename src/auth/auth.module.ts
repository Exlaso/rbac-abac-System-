import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PasswordUtilsService } from '../../helper/password-utils.service';

/**
 * The `AuthModule` is responsible for managing authentication-related functionalities,
 * such as user login, token generation, and verification.
 */
@Module({
  // Importing the `JwtModule` for token generation and validation.
  // Registering it globally ensures it's available throughout the application.
  imports: [
    JwtModule.register({
      global: true, // Makes the module accessible globally without re-importing in other modules.
    }),
  ],

  // The `AuthController` handles HTTP requests for authentication operations, such as login.
  controllers: [AuthController],

  // The `AuthService` contains the core business logic for authentication processes.
  // Additional providers include:
  // - `PrismaService`: For interacting with the database.
  // - `JwtStrategy`: For validating JWT tokens and handling related authorization logic.
  // - `PasswordUtilsService`: For password hashing and validation.
  providers: [
    AuthService,
    PrismaService,
    PasswordUtilsService,
  ],
})
export class AuthModule {}
