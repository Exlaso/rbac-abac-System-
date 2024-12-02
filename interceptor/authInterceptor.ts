import {CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException,} from '@nestjs/common';
import {Observable} from 'rxjs';
import {Request} from 'express';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {TokenDto} from "../dto/token.dto";

@Injectable()
export class AuthInterceptor implements NestInterceptor {
    constructor(
        private readonly JwtStrategy: JwtService,
        private readonly configService: ConfigService,
    ) {
    }

    decryptToken(token: string): TokenDto {
        return this.JwtStrategy.verify(token, {
            secret: this.configService.get<string>('JWT_SECRET'),
        });
    }

    removeBearerPrefix(token: string | undefined): string {
        return token?.split(' ').at(1)
    }
    getTokenFromCookie(cookieString:string | undefined):string | undefined {

        // Return an empty object if cookieString
        // is empty
        if (!cookieString){
            return undefined;
        }

        let pairs = cookieString.split(";");
        let splittedPairs = pairs.map(cookie => cookie.split("="));


        // Create an object with all key-value pairs
        const cookieObj = splittedPairs.reduce(function (obj, cookie) {
            obj[decodeURIComponent(cookie[0].trim())]
                = decodeURIComponent(cookie[1].trim());

            return obj;

        }, {} as {token:string})
        console.log(cookieObj);
        return cookieObj.token
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request: Request = context.switchToHttp().getRequest();
        let token = this.removeBearerPrefix(request.headers.authorization);
        console.log(request.headers.cookie)
        if (!token) {
            token = this.getTokenFromCookie(request.headers.cookie)
        }
        if (!token) throw new UnauthorizedException('Unauthorized Access');
        const user = this.decryptToken(token);
        if (!user) throw new UnauthorizedException('Unauthorized Access');
        request.body = {
            ...request.body,
            token:user,
        }
        return next
            .handle()
    }
}
