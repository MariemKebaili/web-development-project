import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// USERS
export async function getUsers() {
  return prisma.user.findMany();
}

export async function createUser(data) {
  return prisma.user.create({ data });
}

// POSTS
export async function getPosts() {
  return prisma.post.findMany({
    include: { author: true }
  });
}

export async function createPost(data) {
  return prisma.post.create({ data });
}