import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from "../../prisma/prisma.service";
import { TokenDto } from 'dto/token.dto';
import { hasPermission } from "../../role";

@Injectable()
export class PostService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Updates an existing post by its ID.
     * Ensures the user has the appropriate permissions before updating.
     * @param id - The unique identifier of the post to update.
     * @param tokenData - Contains the updated data and user token information.
     * @returns Updated post with associated comments.
     * @throws BadRequestException if the user lacks permission to update the post.
     */
    async update(id: string, tokenData: UpdatePostDto) {
        const { title, content, isPublished } = tokenData;

        // Verify if the user has the required permission to update the post.
        if (!hasPermission(tokenData.token, 'posts', 'update', await this.findOne(id, tokenData as TokenDto))) {
            throw new BadRequestException('You do not have permission to update this post');
        }

        // Update the post with new data and include its comments.
        return this.prisma.posts.update({
            where: { id },
            include: { PostComments: true },
            data: { title, content, isPublished }
        });
    }

    /**
     * Retrieves all posts authored by the current user.
     * Filters posts based on the user's permission to view them.
     * @param token - The token containing user authentication details.
     * @returns List of posts authored by the user with associated comments.
     */
    async findAuthoredPost(token: TokenDto) {
        return (await this.prisma.posts.findMany({
            where: { authorId: token.token.id },
            include: { PostComments: true },
        })).filter(post => hasPermission(token.token, 'posts', 'view', post)); // Filter posts without view permission.
    }

    /**
     * Creates a new post and associates it with the current user.
     * @param createPostDto - Data transfer object containing post details and user token.
     * @returns Newly created post.
     */
    create(createPostDto: CreatePostDto) {
        const { token: { id }, ...rest } = createPostDto;

        // Create a new post and associate it with the author's ID.
        return this.prisma.posts.create({
            data: {
                author: { connect: { id: id } },
                ...rest
            }
        });
    }

    /**
     * Retrieves all posts from the database, including associated comments.
     * Filters the posts based on the user's permission to view them.
     * @param token - The token containing user authentication details.
     * @returns List of posts the user has permission to view.
     */
    async findAll(token: TokenDto) {
        return (await this.prisma.posts.findMany({ include: { PostComments: true } }))
            .filter(post => hasPermission(token.token, 'posts', 'view', post));
    }

    /**
     * Retrieves a specific post by its ID.
     * Allows access if the post is published or the user is the author.
     * Ensures the user has permission to view the post.
     * @param id - The unique identifier of the post.
     * @param token - The token containing user authentication details.
     * @returns The requested post with associated comments.
     * @throws BadRequestException if the user lacks permission to view the post.
     */
    async findOne(id: string, token: TokenDto) {
        const res = await this.prisma.posts.findUniqueOrThrow({
            include: { PostComments: true },
            where: {
                id,
                OR: [
                    { isPublished: true }, // Allow access if the post is published.
                    { authorId: token.token.id } // Allow access if the user is the author.
                ]
            }
        });

        // Check if the user has permission to view the post.
        if (hasPermission(token.token, 'posts', 'view', res)) {
            return res;
        } else {
            throw new BadRequestException('You do not have permission to view this post');
        }
    }

    /**
     * Deletes a post by its ID.
     * Ensures the user has the required permission to delete the post.
     * @param id - The unique identifier of the post to delete.
     * @param tokenData - Contains the user token information.
     * @returns The deleted post's data.
     * @throws BadRequestException if the user lacks permission to delete the post.
     */
    async remove(id: string, tokenData: TokenDto) {
        // Verify if the user has the required permission to delete the post.
        if (!hasPermission(tokenData.token, 'posts', 'delete', await this.findOne(id, tokenData))) {
            throw new BadRequestException('You do not have permission to delete this post');
        } else {
            // Delete the post by its ID.
            return this.prisma.posts.delete({
                where: { id }
            });
        }
    }
}
