import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * The `PrismaService` extends the `PrismaClient` to provide a globally available
 * database client for interacting with the database.
 * It integrates seamlessly with the NestJS lifecycle by implementing `OnModuleInit`,
 * ensuring that the connection to the database is established when the module is initialized.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Customize the PrismaClient configuration
    super({
      // Enable logging for various levels:
      // - `query`: Emits an event for every database query.
      // - `info`: Logs informational messages to stdout.
      // - `warn`: Logs warnings to stdout.
      // - `error`: Logs errors to stdout.
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      // Set error formatting to `colorless` for cleaner and simpler logs.
      errorFormat: 'colorless',
    });
  }

  /**
   * Lifecycle hook that runs when the module is initialized.
   * Establishes a connection to the database.
   */
  async onModuleInit() {
    await this.$connect(); // Connect to the database using Prisma.
  }
}
