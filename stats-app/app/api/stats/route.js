import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const totalPosts = await prisma.post.count();
  const totalUsers = await prisma.user.count();

  const avgPosts = totalUsers === 0 ? 0 : totalPosts / totalUsers;


  const mostActive = await prisma.post.groupBy({
  by: ['authorId'],
  _count: { authorId: true },
  orderBy: { _count: { authorId: 'desc' } },
  take: 5
});


  const postsPerUser = await prisma.post.groupBy({
    by: ['authorId'],
    _count: true
  });

  const latestPost = await prisma.post.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  return Response.json({
    totalPosts,
    totalUsers,
    avgPosts,
    mostActive,
    postsPerUser,
    latestPost
  });
}

