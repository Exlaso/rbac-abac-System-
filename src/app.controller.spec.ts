
// Mock Data
import {BaseRole, PostComments, Posts} from "@prisma/client";
import {hasPermission} from "../role";

const mockComment: PostComments & { post: Posts } = {
  id: "comment1",
  content: "This is a test comment",
  createdDate: new Date(),
  postId: "post1",
  userId: "user1",
  post: {
    id: "post1",
    title: "Test Post",
    content: "Test content",
    authorId: "user1",
    createdDate: new Date(),
    isPublished: true,
  },
};

const mockPost: Posts = {
  id: "post1",
  title: "Test Post",
  content: "Test content",
  authorId: "user1",
  createdDate: new Date(),
  isPublished: true,
};

const unpublishedPost: Posts = {
  ...mockPost,
  authorId:'user2',
  isPublished: false,
};

const adminUser = {
  id: "admin1",
  fullName: "Admin User",
  role: ["ADMIN"] as BaseRole[],
  phoneNumber: "1234567890",
  createdDate: new Date().toISOString(),
};

const moderatorUser = {
  id: "mod1",
  fullName: "Moderator User",
  role: ["MODERATOR"] as BaseRole[],
  phoneNumber: "1234567890",
  createdDate: new Date().toISOString(),
};

const regularUser = {
  id: "user1",
  fullName: "Regular User",
  role: ["USER"] as BaseRole[],
  phoneNumber: "1234567890",
  createdDate: new Date().toISOString(),
};

const anotherUser = {
  id: "user2",
  fullName: "Another User",
  role: ["USER"] as BaseRole[],
  phoneNumber: "0987654321",
  createdDate: new Date().toISOString(),
};

// Test Cases
describe("RBAC Permission Tests", () => {
  describe("Admin Permissions", () => {
    test("Admin can view any comment", () => {
      expect(hasPermission(adminUser, "comments", "view", mockComment)).toBe(true);
    });

    test("Admin can create a comment", () => {
      expect(hasPermission(adminUser, "comments", "create", mockComment)).toBe(true);
    });

    test("Admin can update any comment", () => {
      expect(hasPermission(adminUser, "comments", "update", mockComment)).toBe(true);
    });

    test("Admin can delete any comment", () => {
      expect(hasPermission(adminUser, "comments", "delete", mockComment)).toBe(true);
    });

    test("Admin can view any post", () => {
      expect(hasPermission(adminUser, "posts", "view", mockPost)).toBe(true);
    });

    test("Admin can create a post", () => {
      expect(hasPermission(adminUser, "posts", "create", mockPost)).toBe(true);
    });

    test("Admin can update any post", () => {
      expect(hasPermission(adminUser, "posts", "update", mockPost)).toBe(true);
    });

    test("Admin can delete any post", () => {
      expect(hasPermission(adminUser, "posts", "delete", mockPost)).toBe(true);
    });
  });

  describe("Moderator Permissions", () => {
    test("Moderator can view any comment", () => {
      expect(hasPermission(moderatorUser, "comments", "view", mockComment)).toBe(true);
    });

    test("Moderator can update their own comments", () => {
      const comment = { ...mockComment, userId: moderatorUser.id };
      expect(hasPermission(moderatorUser, "comments", "update", comment)).toBe(true);
    });

    test("Moderator cannot update others' comments", () => {
      expect(hasPermission(moderatorUser, "comments", "update", mockComment)).toBe(false);
    });

    test("Moderator can delete any comment", () => {
      expect(hasPermission(moderatorUser, "comments", "delete", mockComment)).toBe(true);
    });

    test("Moderator can view any post", () => {
      expect(hasPermission(moderatorUser, "posts", "view", mockPost)).toBe(true);
    });

    test("Moderator can update their own posts", () => {
      const post = { ...mockPost, authorId: moderatorUser.id };
      expect(hasPermission(moderatorUser, "posts", "update", post)).toBe(true);
    });

    test("Moderator cannot update others' posts", () => {
      expect(hasPermission(moderatorUser, "posts", "update", mockPost)).toBe(false);
    });
  });

  describe("User Permissions", () => {
    test("User can view their own published post", () => {
      expect(hasPermission(regularUser, "posts", "view", mockPost)).toBe(true);
    });

    test("User can view another user's published post", () => {
      expect(hasPermission(regularUser, "posts", "view", { ...mockPost, authorId: anotherUser.id })).toBe(true);
    });

    test("User cannot view an unpublished post from another user", () => {
      expect(hasPermission(regularUser, "posts", "view", unpublishedPost)).toBe(false);
    });

    test("User can update their own comment", () => {
      expect(hasPermission(regularUser, "comments", "update", mockComment)).toBe(true);
    });

    test("User cannot update another user's comment", () => {
      const comment = { ...mockComment, userId: anotherUser.id };
      expect(hasPermission(regularUser, "comments", "update", comment)).toBe(false);
    });

    test("User can delete their own comment", () => {
      expect(hasPermission(regularUser, "comments", "delete", mockComment)).toBe(true);
    });

    test("User can delete a comment on their own post", () => {
      const commentOnOwnPost = { ...mockComment, post: { ...mockComment.post, authorId: regularUser.id } };
      expect(hasPermission(regularUser, "comments", "delete", commentOnOwnPost)).toBe(true);
    });

    test("User can delete another user's comment not on their post", () => {
      const comment = { ...mockComment, userId: anotherUser.id };
      expect(hasPermission(regularUser, "comments", "delete", comment)).toBe(true);
    });
  });
});
