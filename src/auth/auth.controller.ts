import { Body, Controller, Post, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { UserSignInCreds, UserSignUpCreds } from './dto/user';

/**
 * The `AuthController` is responsible for handling HTTP requests related to user authentication.
 * It includes routes for user login and signup.
 * The base route for this controller is `{Domain}/`.
 */
@Controller('/')
export class AuthController {
    /**
     * Injects the `AuthService` to handle business logic related to authentication.
     * @param authService - The service responsible for authentication logic.
     */
    constructor(private readonly authService: AuthService) {}

    /**
     * Handles the login route for users at `POST /sign-in`.
     * Validates user credentials, generates a JWT token, and sets it in a cookie.
     *
     * @param Credentials - The user's login credentials (email and password).
     * @param res - The response object to set cookies.
     * @returns An object containing the token, user payload, and a success message.
     * @throws UnauthorizedException - If the credentials are invalid.
     */
    @Post('sign-in')
    async asyncLogin(
        @Body() Credentials: UserSignInCreds, // Request body mapped to `UserSignInCreds` DTO.
        @Res({ passthrough: true }) res: Response, // Enables response passthrough for setting cookies.
    ) {
        // Validate user credentials and get the user payload.
        const payload = await this.authService.signIn(Credentials);
        if (!payload) throw new UnauthorizedException('Invalid Credentials');

        // Generate a JWT token with a 7-day expiration.
        const token = this.authService.generateToken(payload, '7d');

        // Set the token in an HTTP-only cookie.
        res.cookie('token', token, {
            path: '/',
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Cookie expires in 1 week.
        });

        return {
            token,
            ...payload,
            message: 'Login Success',
            error: false,
        };
    }

    /**
     * Handles the signup route for users at `POST /sign-up`.
     * Creates a new user account with the provided credentials.
     *
     * @param Credentials - The user's signup credentials (e.g., name, email, and password).
     * @returns The result of the signup process, including any relevant user data or status messages.
     */
    @Post('sign-up')
    async SignUp(@Body() Credentials: UserSignUpCreds) {
        return this.authService.SignUp(Credentials);
    }
}
