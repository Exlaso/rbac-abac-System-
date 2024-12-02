// Importing necessary types and interfaces from Prisma and DTOs
import { BaseRole, Posts, Prisma } from "@prisma/client";
import { TokenDto } from "./dto/token.dto";

// Type representing the Comment entity with its associated Post
export type Comment = Prisma.PostCommentsGetPayload<{
    include: {
        post: true // Including the associated post data in the comment
    }
}>;

// Type for Role, which is based on BaseRole from Prisma
export type Role = BaseRole;

// Type for User, which extracts the 'token' from TokenDto
export type User = TokenDto['token'];

// A type that defines the permission check for a specific action on a resource
type PermissionCheck<Key extends keyof Permissions> =
    | boolean // The permission could be a simple boolean (allow or deny)
    | ((user: User, data: Permissions[Key]["dataType"]) => boolean); // Or it could be a function that checks permissions dynamically

// RolesWithPermissions type defines a mapping of each role to its specific permissions
type RolesWithPermissions = {
    [R in Role]: Partial<{
        [Key in keyof Permissions]: Partial<{
            [Action in Permissions[Key]["action"]]: PermissionCheck<Key>; // For each action in a resource, a permission check is defined
        }>;
    }>;
};

// Permissions defines the structure of permissions for each resource
type Permissions = {
    // Permissions related to comments, defining available actions (view, create, update, delete)
    comments: {
        dataType: Comment; // The data type associated with the comments
        action: "view" | "create" | "update" | "delete"; // The available actions on the comment resource
    };
    // Permissions related to posts, defining available actions (view, create, update, delete)
    posts: {
        dataType: Posts; // The data type associated with posts
        action: "view" | "create" | "update" | "delete"; // The available actions on the post resource
    };
};

// The ROLES constant defines specific permissions for different roles (ADMIN, MODERATOR, USER)
// Each role can have permissions for actions on comments and posts
const ROLES = {
    ADMIN: {
        comments: {
            view: true, // Admin can view any comment
            create: (userID, comment) => comment.post.isPublished || comment.post.authorId === userID.id, // Admin can create comment if post is published or the user is the author
            update: true, // Admin can update any comment
            delete: true // Admin can delete any comment
        },
        posts: {
            view: true, // Admin can view any post
            create: true, // Admin can create posts
            update: true, // Admin can update any post
            delete: true, // Admin can delete any post
        },
    },
    MODERATOR: {
        comments: {
            view: true, // Moderator can view any comment
            create: (userID, comment) => comment.post.isPublished || comment.post.authorId === userID.id, // Moderator can create comment if post is published or the user is the author
            update: (user, com) => user.id === com.userId, // Moderator can update a comment only if they are the user who created it
            delete: true // Moderator can delete any comment
        },
        posts: {
            view: (user, post) => post.authorId === user.id || post.isPublished, // Moderator can view posts authored by them or published posts
            create: true, // Moderator can create posts
            update: (user, post) => user.id === post.authorId, // Moderator can update posts they authored
            delete: (user, post) => post.authorId === user.id || post.isPublished, // Moderator can delete their posts or published posts
        },
    },
    USER: {
        comments: {
            view: (userID, comment) => comment.post.isPublished || comment.post.authorId === userID.id, // User can view comments if the post is published or they are the author of the post
            create: (userID, comment) => comment.post.isPublished || comment.post.authorId === userID.id, // User can create comment if the post is published or they are the author of the post
            update: (user, comment) => comment.userId === user.id, // User can update their own comments
            delete: (user, comment) => comment.userId === user.id || comment.post.authorId === user.id // User can delete their own comments or comments on their posts
        },
        posts: {
            view: (user, post) => post.authorId === user.id || post.isPublished, // User can view their own posts or published posts
            create: true, // User can create posts
            update: (user, post) => post.authorId === user.id, // User can update their own posts
            delete: (user, post) => post.authorId === user.id // User can delete their own posts
        },
    },
} as const satisfies RolesWithPermissions; // Ensures the structure of ROLES matches the RolesWithPermissions type

// Function to check if a user has permission to perform an action on a resource
export function hasPermission<Resource extends keyof Permissions>(
    user: User, // The user whose permission is being checked
    resource: Resource, // The resource (e.g., comments or posts)
    action: Permissions[Resource]["action"], // The action the user wants to perform (e.g., view, create, update, delete)
    data?: Permissions[Resource]["dataType"] // Optional data (used for actions like create, update, delete that might involve resource data)
) {
    // Check if the user has permission by evaluating their roles
    return user.role.some(role => {
        const permission = (ROLES as RolesWithPermissions)[role][resource]?.[action];

        if (permission == null) return false; // If no permission exists, deny access

        if (typeof permission === "boolean") return permission; // If the permission is a simple boolean, return it

        // If permission is a function, execute it and check if it allows the action
        return data != null && permission(user, data);
    });
}
