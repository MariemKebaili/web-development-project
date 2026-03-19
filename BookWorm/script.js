// Bookworm Social Platform
// Handles authentication, posts, feed, likes, comments, and follow system

// ==============================================
// Local Storage Initialization
// Create main storage object if it doesn't exist
// ==============================================

if (!localStorage.getItem("bookwormData")) {
  const initialData = {
    users: [],
    posts: [],
  };
  localStorage.setItem("bookwormData", JSON.stringify(initialData));
}


// ===============================
// Page Protection
// Redirect if user not logged in
// ===============================

const currentUser = localStorage.getItem("currentUser");

if (!currentUser && window.location.pathname.includes("profile.html")) {
  window.location.href = "login.html";
}


// ========================
// Global State for Filters
// ========================

let currentFilters = {
  author: "",
  book: ""
};


//======================================================
// Utility function to get unique values for suggestions
// =====================================================

function getUniqueValues(key){
  const data = getData();
  const values = data.posts
    .map(post => post[key])
    .filter(v => v && v.trim() !== "");

  return [...new Set(values)];
}


// =====================
// Data Helper Functions
// =====================

function getData() {
  const data = localStorage.getItem("bookwormData");
  return data ? JSON.parse(data) : { users: [], posts: [] };
}

function saveData(data) {
  localStorage.setItem("bookwormData", JSON.stringify(data));
}


// =====================================
// Data Migration
// Converts old posts that used likes: 0
// into the new likedBy: []
// =====================================

function migrateOldData() {
  const data = getData();
  let changed = false;

  data.posts.forEach((post) => {
    if (!Array.isArray(post.likedBy)) {
      post.likedBy = [];
      changed = true;
    }

    // remove old likes field if it exists
    if ("likes" in post) {
      delete post.likes;
      changed = true;
    }

    if (!Array.isArray(post.comments)) {
      post.comments = [];
      changed = true;
    }
  });

  if (changed) {
    saveData(data);
  }
}

migrateOldData();
let activeFeedTab = "following";


// ===========================
// User Registration (Sign Up)
// ===========================

const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const data = getData();

    const existingUser = data.users.find((u) => u.username === username);
    if (existingUser) {
      alert("Username already exists");
      return;
    }

    const newUser = {
      username: username,
      email: email,
      password: password,
      name: username,
      bio: "",
      photo: "",
      followers: [],
      following: [],
    };

    data.users.push(newUser);
    saveData(data);

    alert("Account created!🎉");
    window.location.href = "login.html";
  });
}


// ==========
// User Login
// ==========

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const data = getData();
    const user = data.users.find(
      (u) => u.username === username && u.password === password,
    );

    if (user) {
      localStorage.setItem("currentUser", user.username);
      window.location.href = "profile.html";
    } else {
      alert("Invalid username or password");
    }
  });
}


// ===========
// Create Post
// ===========

const postBtn = document.getElementById("post-btn");

if (postBtn) {
  postBtn.addEventListener("click", function () {
    const postInput = document.getElementById("post-input");
    const postText = postInput.value.trim();
    const authorInput = document.getElementById("author-input").value.trim();
    const bookInput = document.getElementById("book-input").value.trim();

    if (postText === "") return;

    const data = getData();
    const currentUser = localStorage.getItem("currentUser");

    const newPost = {
      id: Date.now(),
      author: currentUser,
      text: postText,
      authorInput: authorInput,
      bookInput: bookInput,
      likedBy: [],
      comments: [],
      timestamp: Date.now(),
    };

    data.posts.push(newPost);
    saveData(data);

    postInput.value = "";

    document.getElementById("author-input").value = "";
    document.getElementById("book-input").value = "";

    loadUserPosts();
    loadGlobalFeed();
    updateProfileUI();
  });
}

const togglePostBtn = document.getElementById("toggle-create-post-btn");
const createPostSection = document.getElementById("create-post-section");

if (togglePostBtn) {
  togglePostBtn.addEventListener("click", () => {
    createPostSection.classList.toggle("hidden");
  });
}


// ===============
// Load User Posts
// ===============

function loadUserPosts() {
  const postList = document.getElementById("user-posts-list");
  if (!postList) return;

  const data = getData();
  const currentUser = localStorage.getItem("currentUser");

  postList.innerHTML = "";

  const userPosts = data.posts.filter((p) => p.author === currentUser);

  if (userPosts.length === 0) {
    postList.innerHTML =
      "<p class='empty-msg'>No posts yet. Start sharing your favorite quotes!</p>";
    return;
  }

  userPosts.reverse().forEach((post) => {
    if (!Array.isArray(post.likedBy)) {
      post.likedBy = [];
    }

    const div = document.createElement("div");
    div.classList.add("post");

    div.innerHTML = `
            <p>
              ${post.text}
              <strong>- ${post.authorInput || "Unknown Author"}
              ${post.bookInput ? `| ${post.bookInput}` : ""}</strong>
            </p>

            <div class="post-actions">
              <button class="like-btn" onclick="handleLike(${post.id})">❤️ ${post.likedBy.length}</button>
              <button class="comment-btn" onclick="showComments(${post.id})">💬 ${post.comments.length}</button>
              <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
            </div>

            <div class="comments-section" id="comments-${post.id}" style="display:none;"></div>
        `;

    postList.appendChild(div);
  });
}


// ===============
// Profile Editing
// ===============

const editBtn = document.getElementById("edit-profile-btn");
const editForm = document.getElementById("edit-form-container");
const saveProfileBtn = document.getElementById("save-changes-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

if (editBtn) {
  editBtn.addEventListener("click", function () {
    const data = getData();
    const currentUser = localStorage.getItem("currentUser");
    const user = data.users.find((u) => u.username === currentUser);

    if (!user) return;

    const photoInput = document.getElementById("input-photo");
    const nameInput = document.getElementById("input-name");
    const usernameInput = document.getElementById("input-username");
    const bioInput = document.getElementById("input-bio");

    if (photoInput) photoInput.value = user.photo || "";
    if (nameInput) nameInput.value = user.name || "";
    if (usernameInput) usernameInput.value = user.username || "";
    if (bioInput) bioInput.value = user.bio || "";

    editForm.classList.remove("hidden");
  });
}

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", () => {
    const data = getData();
    const currentUser = localStorage.getItem("currentUser");
    const userIndex = data.users.findIndex((u) => u.username === currentUser);

    if (userIndex === -1) return;

    const oldUsername = data.users[userIndex].username;
    const newUsername = document.getElementById("input-username").value.trim();

    data.users[userIndex].photo = document
      .getElementById("input-photo")
      .value.trim();
    data.users[userIndex].name = document
      .getElementById("input-name")
      .value.trim();
    data.users[userIndex].username = newUsername;
    data.users[userIndex].bio = document
      .getElementById("input-bio")
      .value.trim();

    if (oldUsername !== newUsername) {
      data.posts.forEach((post) => {
        if (post.author === oldUsername) {
          post.author = newUsername;
        }

        if (Array.isArray(post.likedBy)) {
          post.likedBy = post.likedBy.map((name) =>
            name === oldUsername ? newUsername : name,
          );
        }

        post.comments.forEach((comment) => {
          if (comment.author === oldUsername) {
            comment.author = newUsername;
          }
        });
      });

      data.users.forEach((user) => {
        user.followers = user.followers.map((name) =>
          name === oldUsername ? newUsername : name,
        );
        user.following = user.following.map((name) =>
          name === oldUsername ? newUsername : name,
        );
      });
    }

    saveData(data);
    localStorage.setItem("currentUser", newUsername);
    location.reload();
  });
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", () => {
    editForm.classList.add("hidden");
  });
}


// =============
// Logout System
// =============

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {

    // remove logged-in user
    localStorage.removeItem("currentUser");

    // redirect to login page
    window.location.href = "login.html";
  });
}


// =================
// Update Profile UI
// =================

function updateProfileUI() {
  const data = getData();
  const currentUser = localStorage.getItem("currentUser");
  const user = data.users.find((u) => u.username === currentUser);

  if (!user) return;

  const displayName = document.getElementById("display-name");
  const displayUsername = document.getElementById("display-username");
  const displayBio = document.getElementById("display-bio");
  const profilePic = document.getElementById("profile-pic");
  const postCount = document.getElementById("post-count");
  const followerCount = document.getElementById("follower-count");
  const followingCount = document.getElementById("following-count");

  if (displayName) displayName.textContent = user.name || user.username;
  if (displayUsername) displayUsername.textContent = `@${user.username}`;
  if (displayBio) displayBio.textContent = user.bio || "No bio yet...";
  if (profilePic && user.photo) profilePic.src = user.photo;

  const userPosts = data.posts.filter((p) => p.author === currentUser);

  if (postCount) postCount.textContent = userPosts.length;
  if (followerCount) followerCount.textContent = user.followers.length;
  if (followingCount) followingCount.textContent = user.following.length;
}


// ===========
// Global Feed
// ===========

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function updateFeedTabsUI() {
  const followingTab = document.getElementById("following-tab");
  const exploreTab = document.getElementById("explore-tab");

  if (!followingTab || !exploreTab) return;

  followingTab.classList.toggle("active", activeFeedTab === "following");
  exploreTab.classList.toggle("active", activeFeedTab === "explore");
}

function initializeFeedTabs() {
  const followingTab = document.getElementById("following-tab");
  const exploreTab = document.getElementById("explore-tab");

  if (!followingTab || !exploreTab) return;

  followingTab.addEventListener("click", () => {
    activeFeedTab = "following";
    loadGlobalFeed();
  });

  exploreTab.addEventListener("click", () => {
    activeFeedTab = "explore";
    loadGlobalFeed();
  });

  updateFeedTabsUI();
}


// =============
// Feed Loading
// =============

function loadGlobalFeed() {
  const feedPostsContainer = document.getElementById("feed-posts");
  if (!feedPostsContainer || window.location.pathname.includes("profile.html"))
    return;

  const data = getData();
  const currentUser = localStorage.getItem("currentUser");
  const currentUserObj = data.users.find((u) => u.username === currentUser);

  feedPostsContainer.innerHTML = "";

  if (!currentUserObj) {
    feedPostsContainer.innerHTML =
      "<p class='empty-msg'>Please log in to view your feed.</p>";
    updateFeedTabsUI();
    return;
  }

  let postsToShow = [];

  if (activeFeedTab === "following") {
    postsToShow = data.posts.filter((post) =>
      currentUserObj.following.includes(post.author),
    );

    postsToShow.sort((a, b) => b.timestamp - a.timestamp);
  } else {
    postsToShow = data.posts.filter(
      (post) =>
        post.author !== currentUser &&
        !currentUserObj.following.includes(post.author),
    );

    postsToShow = shuffleArray(postsToShow);
  }

  if (postsToShow.length === 0) {
    feedPostsContainer.innerHTML = `
            <p class="empty-msg">
                ${
                  activeFeedTab === "following"
                    ? "No posts from people you follow yet."
                    : "No explore posts available yet."
                }
            </p>
        `;
    updateFeedTabsUI();
    return;
  }

  postsToShow = postsToShow.filter(post => {
    if(currentFilters.author && (!post.authorInput || !post.authorInput.toLowerCase().includes(currentFilters.author))){
      return false;
    }

    if(currentFilters.book && (!post.bookInput || !post.bookInput.toLowerCase().includes(currentFilters.book))){
      return false;
    }
    return true;
  });


  postsToShow.forEach((post) => {
    if (!Array.isArray(post.likedBy)) {
      post.likedBy = [];
    }

    const isFollowing = currentUserObj.following.includes(post.author);
    const followText = isFollowing ? "Unfollow" : "Follow";

    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    postDiv.innerHTML = `
            <div class="post-header">
                <div class="author-info">
                    <span class="author-name">${post.author}</span>
                    ${post.author !== currentUser ? `<button class="follow-btn" onclick="toggleFollow('${post.author}')">${followText}</button>` : ""}
                </div>
                <span class="timestamp">${formatTimestamp(post.timestamp)}</span>
            </div>

            <div class="post-content">
                <p>
                  ${post.text}
                  <strong>- ${post.authorInput || "Unknown Author"}</strong>
                  ${post.bookInput ? `<br><em>(${post.bookInput})</em>` : ""}
                </p>
            </div>

            <div class="post-actions">
                <button class="like-btn" onclick="handleLike(${post.id})">❤️ ${post.likedBy.length}</button>
                <button class="comment-btn" onclick="toggleCommentBox(${post.id})">💬 ${post.comments.length}</button>
            </div>

            <div id="comment-box-${post.id}" class="hidden">
                <input type="text" class="comment-input" id="comment-input-${post.id}" placeholder="Write a comment...">
                <button class="comment-btn" onclick="addComment(${post.id})">Comment</button>
            </div>

            <div id="comments-${post.id}" class="comments-section">
                ${post.comments.map((c) => `<p><strong>${c.author}</strong>: ${c.text}</p>`).join("")}
            </div>
        `;

    feedPostsContainer.appendChild(postDiv);
  });

  updateFeedTabsUI();
}


// =======================================================
// Filter Functionality
// Filters posts by author name or book title in real-time
// =======================================================

const authorFilter = document.getElementById("filter-author");
const bookFilter = document.getElementById("filter-book");
const clearBtn = document.getElementById("clear-filters-btn");

if(authorFilter){
  authorFilter.addEventListener("input", () => {
    currentFilters.author = authorFilter.value.toLowerCase();
    loadGlobalFeed();
  });
}

if(bookFilter){
  bookFilter.addEventListener("input", () => {
    currentFilters.book = bookFilter.value.toLowerCase();
    loadGlobalFeed();
  });
}

if(clearBtn){
  clearBtn.addEventListener("click", () => {
    currentFilters.author = "";
    currentFilters.book = "";
    authorFilter.value = "";
    bookFilter.value = "";
    loadGlobalFeed();
  });
}


// =============================================
// Author Suggestions
// Shows dropdown of author names based on input
// =============================================

const authorInput = document.getElementById("filter-author");
const authorBox = document.getElementById("author-suggestions");

if(authorInput){
  authorInput.addEventListener("input", () => {

    const value = authorInput.value.toLowerCase();
    authorBox.innerHTML = "";

    if(value === "") return;

    const authors = getUniqueValues("authorInput");

    authors
      .filter(a => a.toLowerCase().includes(value))
      .forEach(a => {
        const div = document.createElement("div");
        div.textContent = a;

        div.onclick = () => {
          authorInput.value = a;
          authorBox.innerHTML = "";
          currentFilters.author = a.toLowerCase();
          loadGlobalFeed();
        };

        authorBox.appendChild(div);
      });
  });
}

// Close suggestions dropdown when clicking outside

document.addEventListener("click", (e) => {
  if(!e.target.closest(".filter-sidebar")){
    document.getElementById("author-suggestions").innerHTML = "";
    document.getElementById("book-suggestions").innerHTML = "";
  }
});


//=============================================
// Book Suggestions
// Shows dropdown of book titles based on input
// ============================================

const bookInput = document.getElementById("filter-book");
const bookBox = document.getElementById("book-suggestions");

if(bookInput){
  bookInput.addEventListener("input", () => {

    const value = bookInput.value.toLowerCase();
    bookBox.innerHTML = "";

    if(value === "") return;

    const books = getUniqueValues("bookInput");

    books
      .filter(b => b.toLowerCase().includes(value))
      .forEach(b => {
        const div = document.createElement("div");
        div.textContent = b;

        div.onclick = () => {
          bookInput.value = b;
          bookBox.innerHTML = "";
          currentFilters.book = b.toLowerCase();
          loadGlobalFeed();
        };

        bookBox.appendChild(div);
      });
  });
}


// =============================================================
// Like Post
// One like per user only: first click like, second click unlike
// =============================================================

function handleLike(postId) {
  const data = getData();
  const currentUser = localStorage.getItem("currentUser");
  const post = data.posts.find((p) => p.id === postId);

  if (!post || !currentUser) return;

  if (!Array.isArray(post.likedBy)) {
    post.likedBy = [];
  }

  if (post.likedBy.includes(currentUser)) {
    post.likedBy = post.likedBy.filter((username) => username !== currentUser);
  } else {
    post.likedBy.push(currentUser);
  }

  saveData(data);

  loadUserPosts();
  loadGlobalFeed();
}

// ====================
// Timestamp Formatting
// ====================

function formatTimestamp(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return minutes + " min ago";
  }

  if (hours < 24) {
    return hours + " hr ago";
  }

  if (days < 7) {
    return days + " day ago";
  }

  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

setInterval(() => {
  loadGlobalFeed();
}, 60000);

// ===========
// Delete Post
// ===========

function deletePost(postId) {
  const data = getData();
  data.posts = data.posts.filter((p) => p.id !== postId);

  saveData(data);
  loadUserPosts();
  loadGlobalFeed();
  updateProfileUI();
}

// ==============
// Comment System
// ==============

function toggleCommentBox(postId) {
  const box = document.getElementById(`comment-box-${postId}`);
  if (box) {
    box.classList.toggle("hidden");
  }
}

function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input) return;

  const text = input.value.trim();
  if (text === "") return;

  const data = getData();
  const post = data.posts.find((p) => p.id === postId);

  if (!post) return;

  post.comments.push({
    author: localStorage.getItem("currentUser"),
    text: text,
  });

  saveData(data);
  input.value = "";
  loadGlobalFeed();
}

// =======================================
// Temporary comments function for profile
// =======================================

function showComments(postId) {
  const data = getData();
  const post = data.posts.find((p) => p.id === postId);
  if (!post) return;

  const commentsDiv = document.getElementById("comments-" + postId);

  if (!commentsDiv) return;

  // toggle show/hide
  if (commentsDiv.style.display === "none") {
    commentsDiv.style.display = "block";
  } else {
    commentsDiv.style.display = "none";
  }

  commentsDiv.innerHTML = "";

  post.comments.forEach((comment) => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${comment.author}</strong>: ${comment.text}`;
    commentsDiv.appendChild(p);
  });
}

// ========================
// Follow / Unfollow System
// ========================

function toggleFollow(author) {
  const data = getData();
  const currentUser = localStorage.getItem("currentUser");

  if (author === currentUser) return;

  const currentUserObj = data.users.find((u) => u.username === currentUser);
  const authorObj = data.users.find((u) => u.username === author);

  if (!currentUserObj || !authorObj) return;

  if (currentUserObj.following.includes(author)) {
    currentUserObj.following = currentUserObj.following.filter(
      (u) => u !== author,
    );
    authorObj.followers = authorObj.followers.filter((u) => u !== currentUser);
  } else {
    currentUserObj.following.push(author);
    authorObj.followers.push(currentUser);
  }

  saveData(data);
  loadGlobalFeed();
  updateProfileUI();
}

function updateLoginButton() {
  const loginBtn = document.getElementById("login-btn");
  if (!loginBtn) return;

  const currentUser = localStorage.getItem("currentUser");

  if (currentUser) {
    loginBtn.textContent = currentUser;
    loginBtn.href = "profile.html";
  } else {
    loginBtn.textContent = "Log in";
    loginBtn.href = "login.html";
  }
}

// ===================
// Page Initialization
// ===================

if (document.getElementById("user-posts-list")) {
  loadUserPosts();
}

if (document.getElementById("display-name")) {
  updateProfileUI();
}

if (document.getElementById("feed-posts")) {
  initializeFeedTabs();
  loadGlobalFeed();
}

const closeDetailBtn = document.getElementById("close-detail-btn");

if (closeDetailBtn) {
  closeDetailBtn.addEventListener("click", () => {
    const postDetail = document.getElementById("post-detail");
    if (postDetail) {
      postDetail.classList.add("hidden");
    }
  });
}

updateLoginButton();