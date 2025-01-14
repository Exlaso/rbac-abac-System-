import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from "path";
import {AppController} from "./app.controller";

/**
 * The root module of the application, which aggregates all feature modules,
 * services, and configurations required for the app's functionality.
 */
@Module({
  // Importing other modules to make their functionality available within the application.
  imports: [
    // ConfigModule is used for accessing environment variables throughout the application.
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration module available globally.
    }),
    AuthModule, // Handles user authentication and authorization functionality.
    PostModule, // Manages post-related features such as creating, viewing, updating, and deleting posts.
    CommentModule, // Manages comment-related features like adding, viewing, and managing comments on posts.
  ],
  // Registers the application controller, which defines the default endpoints of the app.
  controllers: [AppController],
  // Registers the application service, which provides core business logic for app-level operations.
  providers: [],
})
export class AppModule {}
