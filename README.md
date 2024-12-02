# RBAC AND ABAC System

This repository provides a **RBAC AND ABAC System** that helps manage user roles and the associated permissions for resources like **comments** and **posts** in a web application. It uses **TypeScript** and **Prisma** for data modeling, while the permissions system is designed to handle user authorization logic.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Types and Interfaces](#types-and-interfaces)
- [Roles and Permissions](#roles-and-permissions)
- [Permission Check](#permission-check)
- [How to Use](#how-to-use)
- [License](#license)

## Overview

The **Permissions Management System** is designed to control access to resources (such as comments and posts) based on user roles. The system supports different roles (like `ADMIN`, `MODERATOR`, and `USER`) and defines permissions for each role to view, create, update, or delete resources. The system uses TypeScript's strong typing for safe handling of these permissions.

## Features

- Define user roles (`ADMIN`, `MODERATOR`, `USER`) and their permissions.
- Manage permissions for **comments** and **posts** resources.
- Permissions are defined for common actions such as `view`, `create`, `update`, and `delete`.
- Permissions can be conditionally granted based on resource attributes and user information.

## Installation

To get started with this project, follow the steps below to set it up locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/permissions-management.git
cd permissions-management
```

### 2. Install Dependencies
```bash
npm install
```


### 3. Set Up Environment Variables
Create a .env file in the root directory and add the following environment variables:

```bazaar
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
```

### 4. Run the Application
```bazaar
npm run start
```
### Project Structure
- `src/app.module.ts`: The root module of the application, which aggregates all feature modules, services, and configurations required for the app's functionality.
- `src/auth/auth.module.ts`: Handles user authentication and authorization functionality.
- `src/post/post.module.ts`: Manages post-related features such as creating, viewing, updating, and deleting posts.
- `src/comment/comment.module.ts`: Manages comment-related features like adding, viewing, and managing comments on posts.
- `src/role.ts`: Defines types and permissions for different user roles.


### Types and Interfaces
- `Comment`: Represents the Comment entity with its associated Post.
- `Role`: Represents a user role based on BaseRole from Prisma.
- `User`: Represents a user, extracting the token from TokenDto.
- `PermissionCheck`: Defines the permission check for a specific action on a resource.
- `RolesWithPermissions`: Defines a mapping of each role to its specific permissions.
- `Permissions`: Defines the structure of permissions for each resource.


### Roles and Permissions
The system defines specific permissions for different roles (ADMIN, MODERATOR, USER). Each role can have permissions for actions on comments and posts.  
Permission Check

### Permission Check
The `hasPermission` function checks if a user has permission to perform an action on a resource. It evaluates the user's roles and the defined permissions for those roles.
```ts
export function hasPermission<Resource extends keyof Permissions>(
    user: User,
    resource: Resource,
    action: Permissions[Resource]["action"],
    data?: Permissions[Resource]["dataType"]
) {
    return user.role.some(role => {
        const permission = (ROLES as RolesWithPermissions)[role][resource]?.[action];

        if (permission == null) return false;

        if (typeof permission === "boolean") return permission;

        return data != null && permission(user, data);
    });
}
```


### How to Use
Define user roles and permissions in `role.ts`.
Use the `hasPermission` function to check if a user has permission to perform an action on a resource.
