import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BodyFromInterceptor = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.body; // Return the modified body
    },
);
