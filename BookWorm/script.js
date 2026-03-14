// =======================================
// Bookworm Social Platform
// Handles authentication, posts, feed,
// likes, comments, and follow system
// =======================================


// ===============================
// Local Storage Initialization
// Create main storage object if it doesn't exist
// ===============================
if (!localStorage.getItem("bookwormData")) {
    const initialData = {
        users: [],
        posts: []
    };
    localStorage.setItem("bookwormData", JSON.stringify(initialData));
}


// ===============================
// Data Helper Functions
// ===============================
function getData() {
    const data = localStorage.getItem("bookwormData");
    return data ? JSON.parse(data) : { users: [], posts: [] };
}

function saveData(data) {
    localStorage.setItem("bookwormData", JSON.stringify(data));
}


// ===============================
// Data Migration
// Converts old posts that used likes: 0
// into the new likedBy: []
// ===============================
function migrateOldData() {
    const data = getData();
    let changed = false;

    data.posts.forEach(post => {
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


// ===============================
// User Registration (Sign Up)
// ===============================
const signupForm = document.getElementById("signup-form");

if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const data = getData();

        const existingUser = data.users.find(u => u.username === username);
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
            following: []
        };

        data.users.push(newUser);
        saveData(data);

        alert("Account created!");
        window.location.href = "login.html";
    });
}


// ===============================
// User Login
// ===============================
const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        const data = getData();
        const user = data.users.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem("currentUser", user.username);
            window.location.href = "profile.html";
        } else {
            alert("Invalid username or password");
        }
    });
}


// ===============================
// Create Post
// ===============================
const postBtn = document.getElementById("post-btn");

if (postBtn) {
    postBtn.addEventListener("click", function () {
        const postInput = document.getElementById("post-input");
        const postText = postInput.value.trim();

        if (postText === "") return;

        const data = getData();
        const currentUser = localStorage.getItem("currentUser");

        const newPost = {
            id: Date.now(),
            author: currentUser,
            text: postText,
            likedBy: [],
            comments: [],
            timestamp: Date.now()
        };

        data.posts.push(newPost);
        saveData(data);

        postInput.value = "";
        loadUserPosts();
        loadGlobalFeed();
        updateProfileUI();
    });
}


// ===============================
// Load User Posts
// ===============================
function loadUserPosts() {
    const postList = document.getElementById("user-posts-list");
    if (!postList) return;

    const data = getData();
    const currentUser = localStorage.getItem("currentUser");

    postList.innerHTML = "";

    const userPosts = data.posts.filter(p => p.author === currentUser);

    if (userPosts.length === 0) {
        postList.innerHTML = "<p class='empty-msg'>No posts yet. Start sharing your favorite quotes!</p>";
        return;
    }

    userPosts.reverse().forEach(post => {
        if (!Array.isArray(post.likedBy)) {
            post.likedBy = [];
        }

        const div = document.createElement("div");
        div.classList.add("post");

        div.innerHTML = `
            <p>${post.text}</p>
            <div class="post-actions">
                <button class="like-btn" onclick="handleLike(${post.id})">❤️ ${post.likedBy.length}</button>
                <button class="comment-btn" onclick="showComments(${post.id})">💬 ${post.comments.length}</button>
                <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
            </div>
        `;

        postList.appendChild(div);
    });
}


// ===============================
// Profile Editing
// ===============================
const editBtn = document.getElementById("edit-profile-btn");
const editForm = document.getElementById("edit-form-container");
const saveProfileBtn = document.getElementById("save-changes-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

if (editBtn) {
    editBtn.addEventListener("click", function () {
        const data = getData();
        const currentUser = localStorage.getItem("currentUser");
        const user = data.users.find(u => u.username === currentUser);

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
        const userIndex = data.users.findIndex(u => u.username === currentUser);

        if (userIndex === -1) return;

        const oldUsername = data.users[userIndex].username;
        const newUsername = document.getElementById("input-username").value.trim();

        data.users[userIndex].photo = document.getElementById("input-photo").value.trim();
        data.users[userIndex].name = document.getElementById("input-name").value.trim();
        data.users[userIndex].username = newUsername;
        data.users[userIndex].bio = document.getElementById("input-bio").value.trim();

        if (oldUsername !== newUsername) {
            data.posts.forEach(post => {
                if (post.author === oldUsername) {
                    post.author = newUsername;
                }

                if (Array.isArray(post.likedBy)) {
                    post.likedBy = post.likedBy.map(name =>
                        name === oldUsername ? newUsername : name
                    );
                }

                post.comments.forEach(comment => {
                    if (comment.author === oldUsername) {
                        comment.author = newUsername;
                    }
                });
            });

            data.users.forEach(user => {
                user.followers = user.followers.map(name =>
                    name === oldUsername ? newUsername : name
                );
                user.following = user.following.map(name =>
                    name === oldUsername ? newUsername : name
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


// ===============================
// Update Profile UI
// ===============================
function updateProfileUI() {
    const data = getData();
    const currentUser = localStorage.getItem("currentUser");
    const user = data.users.find(u => u.username === currentUser);

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

    const userPosts = data.posts.filter(p => p.author === currentUser);

    if (postCount) postCount.textContent = userPosts.length;
    if (followerCount) followerCount.textContent = user.followers.length;
    if (followingCount) followingCount.textContent = user.following.length;
}


// ===============================
// Global Feed
// ===============================
function loadGlobalFeed() {
    const feedContainer = document.querySelector("main.feed");
    if (!feedContainer || window.location.pathname.includes("profile.html")) return;

    const data = getData();
    feedContainer.innerHTML = "";

    [...data.posts].reverse().forEach(post => {
        if (!Array.isArray(post.likedBy)) {
            post.likedBy = [];
        }

        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        postDiv.innerHTML = `
            <div class="post-header">
                <div class="author-info">
                    <span class="author-name">${post.author}</span>
                    <button class="follow-btn" onclick="toggleFollow('${post.author}')">Follow</button>
                </div>
                <span class="timestamp">${formatTimestamp(post.timestamp)}</span>
            </div>

            <div class="post-content">
                <p>${post.text}</p>
            </div>

            <div class="post-actions">
                <button class="like-btn" onclick="handleLike(${post.id})">❤️ ${post.likedBy.length}</button>
                <button class="comment-btn" onclick="toggleCommentBox(${post.id})">💬 ${post.comments.length}</button>
            </div>

            <div id="comment-box-${post.id}" class="hidden">
                <input type="text" class="comment-input" id="comment-input-${post.id}" placeholder="Write a comment...">
                <button class="comment-btn" onclick="addComment(${post.id})">Comment</button>
            </div>

            <div id="comments-${post.id}">
                ${post.comments.map(c => `<p><strong>${c.author}</strong>: ${c.text}</p>`).join("")}
            </div>
        `;

        feedContainer.appendChild(postDiv);
    });
}


// ===============================
// Like Post
// One like per user only
// first click like, second click unlike
// ===============================
function handleLike(postId) {
    const data = getData();
    const currentUser = localStorage.getItem("currentUser");
    const post = data.posts.find(p => p.id === postId);

    if (!post || !currentUser) return;

    if (!Array.isArray(post.likedBy)) {
        post.likedBy = [];
    }

    if (post.likedBy.includes(currentUser)) {
        post.likedBy = post.likedBy.filter(username => username !== currentUser);
    } else {
        post.likedBy.push(currentUser);
    }

    saveData(data);

    loadUserPosts();
    loadGlobalFeed();
}

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

// ===============================
// Delete Post
// ===============================
function deletePost(postId) {
    const data = getData();
    data.posts = data.posts.filter(p => p.id !== postId);

    saveData(data);
    loadUserPosts();
    loadGlobalFeed();
    updateProfileUI();
}


// ===============================
// Comment System
// ===============================
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
    const post = data.posts.find(p => p.id === postId);

    if (!post) return;

    post.comments.push({
        author: localStorage.getItem("currentUser"),
        text: text
    });

    saveData(data);
    input.value = "";
    loadGlobalFeed();
}


// ===============================
// Temporary comments function for profile
// ===============================
function showComments(postId) {
    alert("Comments view is not connected yet for profile posts.");
}


// ===============================
// Follow / Unfollow System
// ===============================
function toggleFollow(author) {
    const data = getData();
    const currentUser = localStorage.getItem("currentUser");

    if (author === currentUser) return;

    const currentUserObj = data.users.find(u => u.username === currentUser);
    const authorObj = data.users.find(u => u.username === author);

    if (!currentUserObj || !authorObj) return;

    if (currentUserObj.following.includes(author)) {
        currentUserObj.following = currentUserObj.following.filter(u => u !== author);
        authorObj.followers = authorObj.followers.filter(u => u !== currentUser);
    } else {
        currentUserObj.following.push(author);
        authorObj.followers.push(currentUser);
    }

    saveData(data);
    loadGlobalFeed();
    updateProfileUI();
}


// ===============================
// Page Initialization
// ===============================
if (document.getElementById("user-posts-list")) {
    loadUserPosts();
}

if (document.getElementById("display-name")) {
    updateProfileUI();
}

if (document.querySelector("main.feed")) {
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