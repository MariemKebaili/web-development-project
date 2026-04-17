import {
  getTotalPosts,
  getTotalUsers,
  getMostActiveUsers,
  getPostsPerUser,
  getLatestPost} from "@/lib/repository";

export async function GET() {
  const totalPosts = await getTotalPosts();
  const totalUsers = await getTotalUsers();

  const avgPosts = totalUsers === 0 ? 0 : totalPosts / totalUsers;

  const mostActive = await getMostActiveUsers();
  const postsPerUser = await getPostsPerUser();

  const latestPost = await getLatestPost();

  return Response.json({
    totalPosts,
    totalUsers,
    avgPosts,
    mostActive,
    postsPerUser,
    latestPost
  });
}