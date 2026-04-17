import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//----- USERS -----//
export async function getUsers() {
  return prisma.user.findMany();
}

export async function createUser(data) {
  return prisma.user.create({ data });
}

//----- POSTS -----//
export async function getPosts() {
  return prisma.post.findMany({
    include: { author: true }
  });
}

export async function createPost(data) {
  return prisma.post.create({ data });
}

//----- STATS -----//
export async function getTotalPosts() {
  return prisma.post.count();
}

export async function getTotalUsers() {
  return prisma.user.count();
}

export async function getMostActiveUsers() {
  return prisma.post.groupBy({
    by: ['authorId'],
    _count: { authorId: true },
    orderBy: { _count: { authorId: 'desc' } },
    take: 5
  });
}

export async function getPostsPerUser() {
  return prisma.post.groupBy({
    by: ['authorId'],
    _count: true
  });
}

export async function getLatestPost() {
  return prisma.post.findFirst({
    orderBy: { createdAt: 'desc' }
  });
}