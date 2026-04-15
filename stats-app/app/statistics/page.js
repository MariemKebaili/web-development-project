async function getStats() {
  const res = await fetch("http://localhost:3000/api/stats");
  return res.json();
}

export default async function StatisticsPage() {
  const stats = await getStats();

  return (
    <main className="feed">

      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>BookWorm Statistics</h1>

      <div className="post">
        <div className="post-header">
          <strong>Total Posts</strong>
        </div>
        <div className="post-content">
          <p>{stats.totalPosts}</p>
        </div>
      </div>

      <div className="post">
        <div className="post-header">
          <strong>Total Users</strong>
        </div>
        <div className="post-content">
          <p>{stats.totalUsers}</p>
        </div>
      </div>

      <div className="post">
        <div className="post-header">
          <strong>Average Posts</strong>
        </div>
        <div className="post-content">
          <p>{stats.avgPosts}</p>
        </div>
      </div>

      <div className="post">
        <div className="post-header">
          <strong>Most Active User</strong>
        </div>
        <div className="post-content">
          <p>User #{stats.mostActive[0].authorId}</p>
        </div>
      </div>

      <div className="post">
        <div className="post-header">
          <strong>Posts Per User</strong>
        </div>
        <div className="post-content">
          {stats.postsPerUser.map((user, index) => (
            <p key={index}>User #{user.authorId}: {user._count}</p>
          ))}
        </div>
      </div>

      <div className="post">
        <div className="post-header">
          <strong>Latest Post</strong>
        </div>
        <div className="post-content">
          <p>"{stats.latestPost.text}"</p>
        </div>
      </div>

    </main>
  );
}