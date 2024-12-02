import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * The `PostModule` defines the structure and dependencies for managing posts.
 * It bundles the `PostService` (business logic) and `PostController` (request handling) together,
 * while also integrating the `PrismaService` for database interactions.
 */
@Module({
  // Controllers handle incoming HTTP requests and map them to appropriate services.
  controllers: [PostController],

  // Providers define the services used within this module.
  // `PostService` contains the business logic related to posts.
  // `PrismaService` is a globally scoped service for database access.
  providers: [PostService, PrismaService],
})
export class PostModule {}
