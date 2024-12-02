import { UseInterceptors,applyDecorators } from '@nestjs/common';
import { AuthInterceptor } from '../interceptor/authInterceptor';

export function TokenAccess() {
  return applyDecorators(
    UseInterceptors(AuthInterceptor),
  );
}