import { Module } from '@nestjs/common';
import { CommentService } from './comment.service'; // Service for handling business logic for comments
import { CommentController } from './comment.controller'; // Controller for handling HTTP requests related to comments
import { PrismaService } from "../../prisma/prisma.service"; // Prisma service to interact with the database
import { PostService } from "../post/post.service"; // Post service for handling operations related to posts

/**
 * The `CommentModule` is a feature module in NestJS for handling the functionality related to comments.
 * It imports and provides the necessary services and controllers to interact with comments in the system.
 */
@Module({
  // Register the CommentController to handle HTTP routes related to comments.
  controllers: [CommentController],

  // Provide the CommentService, PrismaService, and PostService.
  // - `CommentService` contains the business logic for creating, updating, and deleting comments.
  // - `PrismaService` is used for database operations, including reading and writing comments.
  // - `PostService` is injected to allow the `CommentService` to access and work with posts.
  providers: [CommentService, PrismaService, PostService],
})
export class CommentModule {}
