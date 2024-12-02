import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost): void {
        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();
        console.error(
            '+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++',
        );
        console.error('Caught an exception');
        console.error(exception);
        console.error(
            '+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++',
        );

        let message: string | object =
            exception instanceof Error ? exception.message : (exception as Error);
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

        if (exception instanceof HttpException) {
            message = exception.getResponse();
            statusCode = exception.getStatus();
        }

        // log the error to the file
        // `./logs/${fileName}`,
        // `Date: ${new Date().toISOString()} \n
        //  Error: ${JSON.stringify(exception)}\n
        //  URL: ${ctx.getRequest().url}\n
        //  Method: ${ctx.getRequest().method}\n
        //   Body: ${JSON.stringify(ctx.getRequest().body)}\n
        //   Query: ${JSON.stringify(ctx.getRequest().query)}\n

        //  `,

        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            if (exception.code === 'P2002') {


                statusCode = HttpStatus.CONFLICT;
                message = `${exception.meta.modelName} Already Exists`;
            }
            if (exception.code === 'P2025') {
                statusCode = HttpStatus.NOT_FOUND;
                console.log(exception)
                message = this.beautifyErrorMessage(exception);
            }
            if (exception.code === 'P2014') {

                statusCode = HttpStatus.NOT_FOUND;
                message = `${exception.meta.modelName} Not Found`;
            }
            if (exception.code === 'P2016') {

                statusCode = HttpStatus.NOT_FOUND;
                message = `${exception.meta.modelName} Not Found`;
            }
            if (exception.code === 'P2023') {

                statusCode = HttpStatus.BAD_REQUEST;
                const match = exception.message.match(
                    /instead got: "(.*?)", length (\d+)/,
                );
                if (match) {
                    const [_, id] = match;
                    message = `The provided ID is invalid. It has a Value of '${id}' but it should be exactly 12 bytes.`;
                } else {
                    message = `Invalid ID Provided`;
                }
            }
        }

        const responseBody = {
            message,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
    }

    beautifyErrorMessage(error: {
        meta?: { modelName?: string; cause?: string };
    }) {
        if (error.meta?.modelName && error.meta?.cause) {
            // Return a custom message if the error can be parsed
            console.log(error.meta)
            return this.beautifyMetaError(error.meta).Issue;
        }
        // Return the original message if it can't be parsed
        return error;
    }

    beautifyMetaError(metaError: any) {
        const { modelName, cause } = metaError;

        // Split the cause string into sentences
        const causeSentences = cause.split('.');

        // Extract the missing record and the relation from the cause string
        const missingRecord = causeSentences.at(0).split("'")?.at(1);

        // Construct a more readable cause string
        const readableCause = `The ${modelName || missingRecord} Does Not Exists.`;

        return {
            ModelName: modelName,
            Issue: readableCause,
        };
    }
}
