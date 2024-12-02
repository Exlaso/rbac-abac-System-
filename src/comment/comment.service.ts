import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto'; // DTO for creating a comment
import { UpdateCommentDto } from './dto/update-comment.dto'; // DTO for updating a comment
import { PrismaService } from "../../prisma/prisma.service"; // Prisma service for interacting with the database
import { hasPermission } from "../../role"; // Utility function to check user permissions
import { TokenDto } from 'dto/token.dto'; // DTO for token information (used for authentication)
import { PostService } from "../post/post.service"; // Service for handling post-related operations

@Injectable()
export class CommentService {
    // Fetch all comments posted by the current user
    async findByUser(token: TokenDto) {
        // Fetch all comments where the userId matches the token's user ID
        // Also includes post information (to fetch associated post data)
        return (await this.prisma.postComments.findMany({
            where: { userId: token.token.id },
            include: { post: true },
        }))
            // Filters comments based on whether the user has permission to view them
            .filter(postComments => hasPermission(token.token, 'comments', 'view', postComments));
    }

    constructor(
        private readonly prisma: PrismaService, // Prisma service instance to interact with the database
        private readonly post: PostService, // Post service instance to interact with posts
    ) {}

    // Create a new comment
    async create(createCommentDto: CreateCommentDto) {
        console.log(createCommentDto.token); // Logs the token (for debugging purposes)

        // Check if the user has permission to create a comment for the specified post
        const postData = await this.post.findOne(createCommentDto.postId, createCommentDto);
        if (!hasPermission(createCommentDto.token, 'comments', 'create', {
            post: postData,
            content: "",
            postId: createCommentDto.postId,
            createdDate: new Date(),
            userId: "",
            id: "",
        })) {
            // If permission is denied, throw a BadRequestException
            throw new BadRequestException('You do not have permission to create a comment');
        }

        // Create a new comment and associate it with a post and a user (from token)
        return this.prisma.postComments.create({
            data: {
                content: createCommentDto.content,
                post: {
                    connect: {
                        id: createCommentDto.postId, // Connect the comment to a post by its ID
                    },
                },
                user: { connect: { id: createCommentDto.token.id } }, // Connect the comment to the current user (from token)
            },
        });
    }

    // Fetch all comments related to a specific post
    async findAll(token: TokenDto, postID: string) {
        // Fetch all comments for the given post ID
        return (await this.prisma.postComments.findMany({
            where: { postId: postID },
            include: { post: true }, // Include post data in the response
        }))
            // Filters comments based on whether the user has permission to view them
            .filter(postComments => hasPermission(token.token, 'comments', 'view', postComments));
    }

    // Fetch a single comment by its ID
    async findOne(id: string) {
        return this.prisma.postComments.findUnique({
            where: { id }, // Find the comment by ID
            include: { post: true }, // Include associated post data
        });
    }

    // Update a comment by its ID
    async update(id: string, updateCommentDto: UpdateCommentDto) {
        // Check if the user has permission to update the comment
        if (!hasPermission(updateCommentDto.token, 'comments', 'update', await this.findOne(id))) {
            // If permission is denied, throw a BadRequestException
            throw new BadRequestException('You do not have permission to update a comment');
        }

        // Update the comment's content
        return this.prisma.postComments.update({
            where: { id }, // Find the comment by its ID
            data: { content: updateCommentDto.content }, // Update the content of the comment
        });
    }

    // Remove a comment by its ID
    async remove(id: string, token: UpdateCommentDto) {
        // Check if the user has permission to delete the comment
        if (hasPermission(token.token, 'comments', 'update', await this.findOne(id))) {
            // If permission is denied, throw a BadRequestException
            throw new BadRequestException('You do not have permission to delete this comment');
        }

        // Delete the comment identified by the ID
        return this.prisma.postComments.delete({ where: { id } });
    }
}
