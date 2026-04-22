async function getStats() {
  const res = await fetch("http://localhost:3000/api/stats", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export default async function StatisticsPage() {
  const stats = await getStats();

  return (
    <main className="feed" style={{ maxWidth: "800px", margin: "auto", padding: "2rem" }}>

      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Bookworms Statistics</h1>

      <div className="post">
        <div className="post-header"><strong>Total Posts</strong></div>
        <div className="post-content">
          <p>{stats.totalPosts} posts shared on Bookworms</p>
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Total Users</strong></div>
        <div className="post-content">
          <p>{stats.totalUsers} registered users</p>
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Average Posts Per User</strong></div>
        <div className="post-content">
          <p>{stats.avgPostsPerUser} posts per user on average</p>
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Most Active Users (Top 5)</strong></div>
        <div className="post-content">
          {stats.mostActiveUsers?.length > 0 ? (
            stats.mostActiveUsers.map((u, i) => (
              <p key={i}>
                {i + 1}. <strong>@{u.author}</strong> — {u._count.author} posts
              </p>
            ))
          ) : (
            <p>No data yet.</p>
          )}
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Posts Per User</strong></div>
        <div className="post-content">
          {stats.postsPerUser?.length > 0 ? (
            stats.postsPerUser.map((u, i) => (
              <p key={i}>
                <strong>@{u.author}</strong>: {u._count.author} posts
              </p>
            ))
          ) : (
            <p>No data yet.</p>
          )}
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Latest Post</strong></div>
        <div className="post-content">
          {stats.latestPost ? (
            <>
              <p>"{stats.latestPost.text}"</p>
              <p style={{ fontSize: "0.9rem", marginTop: "0.3rem" }}>
                — posted by <strong>@{stats.latestPost.author}</strong>
              </p>
            </>
          ) : (
            <p>No posts yet.</p>
          )}
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Users With No Posts</strong></div>
        <div className="post-content">
          {stats.inactiveUsers?.length > 0 ? (
            stats.inactiveUsers.map((u, i) => (
              <p key={i}>@{u.username}</p>
            ))
          ) : (
            <p>All users have posted at least once!</p>
          )}
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>🆕 Newest Member</strong></div>
        <div className="post-content">
          {stats.newestUser ? (
            <p>
              <strong>@{stats.newestUser.username}</strong>
              {stats.newestUser.name !== stats.newestUser.username ? ` (${stats.newestUser.name})` : ""}
            </p>
          ) : (
            <p>No users yet.</p>
          )}
        </div>
      </div>

    </main>
  );
}