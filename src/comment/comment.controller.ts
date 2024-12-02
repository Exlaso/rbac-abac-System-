import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommentService } from './comment.service'; // Service for handling comment-related business logic
import { CreateCommentDto } from './dto/create-comment.dto'; // DTO (Data Transfer Object) for creating a new comment
import { UpdateCommentDto } from './dto/update-comment.dto'; // DTO for updating an existing comment
import { TokenDto } from "../../dto/token.dto"; // DTO for token information (to be used for authorization)
import { TokenAccess } from "../../decorators/token.decorator"; // Custom decorator that ensures the user has token access for protected routes
import { BodyFromInterceptor } from "../../helper/interceptor-body.decorator"; // Custom decorator to intercept and attach token from the request

@Controller('comment')
@TokenAccess() // Apply TokenAccess decorator to ensure the user has a valid token before performing any action
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // Create a new comment
  @Post()
  create(@Body() token: CreateCommentDto) {
    // Calls the create method of the commentService to create a new comment
    // The body of the request contains the data necessary for creating the comment
    return this.commentService.create(token);
  }

  // Get all comments related to a specific post
  @Get('by-post/:id')
  findAll(@BodyFromInterceptor() token: TokenDto, @Param('id') id: string) {
    // Calls the findAll method of the commentService to fetch comments for a given post
    // The 'id' parameter represents the post ID, and 'token' contains user-related info to check authorization
    return this.commentService.findAll(token, id);
  }

  // Get all comments posted by the currently authenticated user
  @Get('by-user')
  findSelfPosted(@BodyFromInterceptor() token: TokenDto) {
    // Calls the findByUser method of the commentService to fetch all comments made by the authenticated user
    // The 'token' is used to identify the current user
    return this.commentService.findByUser(token);
  }

  // Update an existing comment by its ID
  @Patch(':id')
  update(@Param('id') id: string, @Body() token: UpdateCommentDto) {
    // Calls the update method of the commentService to modify the content of the comment with the given ID
    // The 'id' parameter is the comment's unique identifier, and the 'token' contains the updated comment data
    return this.commentService.update(id, token);
  }

  // Remove a comment by its ID
  @Delete(':id')
  remove(@Param('id') id: string, @Body() token: UpdateCommentDto) {
    // Calls the remove method of the commentService to delete the comment identified by the 'id' parameter
    // The 'token' holds necessary details for the deletion process, such as authorization or user identity
    return this.commentService.remove(id, token);
  }
}
