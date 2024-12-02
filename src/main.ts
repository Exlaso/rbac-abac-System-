import {HttpAdapterHost, NestFactory} from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {AllExceptionsFilter} from "../exception";

async function bootstrap() {

  // create next app
  const app = await NestFactory.create(AppModule);


  // setting up the swagger for api and CRUD operations
  const config = new DocumentBuilder()
      .setTitle('RBAC + ABAC by Vedant Bhavsar')
      .setDescription('Social Media where User can share their thoughts in form of text. Moderator Manages the Posts and Users from being abusive. Admin is the Super User who can manage everything.')
      .setVersion('1.0')
      .addTag('RBAC')
      .addBearerAuth(undefined, 'defaultBearerAuth')
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);
  app.enableCors();


  // setting up the global pipes and filters
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));


  // listen to the port
  await app.listen(3000);

  return "Server is running on port 3000";
}
bootstrap().then(console.info);
