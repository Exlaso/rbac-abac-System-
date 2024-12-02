import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { TokenAccess } from "../../decorators/token.decorator";
import { TokenDto } from "../../dto/token.dto";
import { hasPermission } from "../../role";
import { BodyFromInterceptor } from "../../helper/interceptor-body.decorator";

// Setting the base route for this controller as /post
@Controller('post')
@TokenAccess() // Custom decorator for token-based access control
export class PostController {
    constructor(private readonly postService: PostService) {}

    /**
     * Handles POST requests to create a new post.
     * Verifies if the user has the permission to create a post.
     * @param createPostDto - The data transfer object containing post details and user token.
     * @returns The created post.
     * @throws BadRequestException if the user lacks permission to create a post.
     */
    @Post()
    create(@Body() createPostDto: CreatePostDto) {
        // Check if the user has 'create' permission for posts.
        if (!hasPermission(createPostDto.token, 'posts', 'create')) {
            throw new BadRequestException('You do not have permission to create a post');
        }

        // Delegate post creation to the PostService.
        return this.postService.create(createPostDto);
    }

    /**
     * Handles GET requests to retrieve all published posts.
     * Filters posts based on the user's permission to view them.
     * @param token - The user authentication token.
     * @returns List of posts the user has permission to view.
     */
    @Get()
    findAll(@BodyFromInterceptor() token: TokenDto) {
        return this.postService.findAll(token);
    }

    /**
     * Handles GET requests to retrieve all posts authored by the current user.
     * @param token - The user authentication token.
     * @returns List of posts authored by the user.
     */
    @Get("authored")
    findAuthoredPost(@BodyFromInterceptor() token: TokenDto) {
        return this.postService.findAuthoredPost(token);
    }

    /**
     * Handles GET requests to retrieve a single post by its ID.
     * Ensures the user has permission to view the requested post.
     * @param id - The unique identifier of the post.
     * @param token - The user authentication token.
     * @returns The requested post details.
     * @throws BadRequestException if the user lacks permission to view the post.
     */
    @Get(':id')
    findOne(@Param('id') id: string, @BodyFromInterceptor() token: TokenDto) {
        return this.postService.findOne(id, token);
    }

    /**
     * Handles PATCH requests to update a specific post by its ID.
     * Ensures the user has permission to update the post.
     * @param id - The unique identifier of the post.
     * @param tokenData - Contains the updated post data and user token.
     * @returns The updated post details.
     * @throws BadRequestException if the user lacks permission to update the post.
     */
    @Patch(':id')
    update(@Param('id') id: string, @Body() tokenData: UpdatePostDto) {
        return this.postService.update(id, tokenData);
    }

    /**
     * Handles DELETE requests to remove a specific post by its ID.
     * Ensures the user has permission to delete the post.
     * @param id - The unique identifier of the post.
     * @param tokenData - Contains the user token for permission verification.
     * @returns The details of the deleted post.
     * @throws BadRequestException if the user lacks permission to delete the post.
     */
    @Delete(':id')
    remove(@Param('id') id: string, @BodyFromInterceptor() tokenData: TokenDto) {
        return this.postService.remove(id, tokenData);
    }
}
