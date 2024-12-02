import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserSignInCreds, UserSignUpCreds } from './dto/user';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordUtilsService } from '../../helper/password-utils.service';

/**
 * The `AuthService` handles the business logic related to user authentication,
 * including signing up, signing in, token generation, and credential validation.
 */
@Injectable()
export class AuthService {
    /**
     * Constructor to inject dependencies such as PrismaService, JwtService, ConfigService, and PasswordUtilsService.
     * @param prisma - Service for interacting with the database.
     * @param JwtStrategy - Service for JWT token creation and verification.
     * @param configService - Service for accessing environment variables.
     * @param utilService - Utility service for password encryption and comparison.
     */
    constructor(
        private readonly prisma: PrismaService,
        private readonly JwtStrategy: JwtService,
        private readonly configService: ConfigService,
        private readonly utilService: PasswordUtilsService,
    ) {}

    /**
     * Creates a new user account in the database.
     * Encrypts the user's password before storing it in the database.
     *
     * @param Credentials - The user's signup credentials (name, phone number, and password).
     * @returns The created user record from the database.
     */
    async SignUp(Credentials: UserSignUpCreds) {
        return this.prisma.user.create({
            data: {
                ...Credentials,
                password: await this.utilService.encryptPassword(Credentials.password), // Encrypt the password
            },
        });
    }

    /**
     * Handles user login by validating credentials against the database.
     * Verifies the user's password and returns their information if valid.
     *
     * @param credentials - The user's login credentials (phone number and password).
     * @returns The user data (excluding the password) if credentials are valid.
     * @throws BadRequestException - If the user is not found.
     * @throws UnauthorizedException - If the password is invalid.
     */
    async signIn(credentials: UserSignInCreds) {
        // Retrieve user record based on phone number.
        const db_creds = await this.prisma.user.findUnique({
            where: {
                phoneNumber: credentials.phoneNumber,
            },
        });

        // Throw an error if the user is not found.
        if (!db_creds) throw new BadRequestException('Invalid Credentials');

        const { password, ...rest } = db_creds;

        // Validate the provided password.
        if (await this.isCredentialsNotValid(password, credentials.password)) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        // Return the user data (excluding the password).
        return rest;
    }

    /**
     * Generates a JWT token for a user with a specified expiration duration.
     *
     * @param payLoad - The payload to include in the token (e.g., user details).
     * @param duration - The token's expiration duration (default is 60 seconds).
     * @returns The generated JWT token as a string.
     */
    generateToken(payLoad: any, duration: string = '60s') {
        return this.JwtStrategy.sign(payLoad, {
            expiresIn: duration,
            secret: this.configService.get<string>('JWT_SECRET'), // Retrieve the JWT secret from environment variables.
        });
    }

    /**
     * Validates whether the provided password matches the stored password.
     *
     * @param db_password - The encrypted password stored in the database.
     * @param user_password - The plain text password provided by the user.
     * @returns A boolean indicating whether the credentials are invalid.
     */
    async isCredentialsNotValid(db_password: string, user_password: string) {
        return !(await this.utilService.decryptPassword(
            db_password,
            user_password,
        ));
    }
}
