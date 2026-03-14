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
// getData(): retrieve stored data
// saveData(): update localStorage
// ===============================
function getData() {
    const data = localStorage.getItem("bookwormData");
    return data ? JSON.parse(data) : { users: [], posts: [] };
}

function saveData(data) {
    localStorage.setItem("bookwormData", JSON.stringify(data));
}


// ===============================
// User Registration (Sign Up)
// Handles creating a new user account
// ===============================
const signupForm = document.getElementById("signup-form");

if (signupForm) {

    signupForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const data = getData();

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

        alert("Account created!")

        window.location.href = "login.html";
    });
}


// ===============================
// User Login
// Checks username and password
// Saves currentUser in localStorage
// ===============================
const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
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
// Allows the logged-in user to publish a new post
// ===============================
const postBtn = document.getElementById('post-btn');

if (postBtn) {

    postBtn.addEventListener("click", function () {
        const postText = document.getElementById("post-input").value;

        if (postText.trim() === "") return;

        const data = getData();
        const currentUser = localStorage.getItem("currentUser");

       const newPost = {
            id: Date.now(),
            author: currentUser,
            text: postText,
            likes: 0,
            comments: [],
            timestamp: Date.now()
            };

        data.posts.push(newPost);
        saveData(data);

        alert("Post created!");

        location.reload();
    });
}


// ===============================
// Load User Posts
// Displays posts created by the current user
// Used on the Profile page
// ===============================
function loadUserPosts() {
    const postList = document.getElementById("user-posts-list");

    if (!postList) return;

    const data = getData();
    const currentUser = localStorage.getItem("currentUser");

    postList.innerHTML = "";

    const userPosts = data.posts.filter(p => p.author === currentUser);

    if (userPosts.length === 0) {
        postList.innerHTML = "<p>No posts yet. Start your favorite qoutes!</p>";
        return;
    }

    userPosts.forEach(post => {
        const div = document.createElement("div");

        div.classList.add("post");

        div.innerHTML = `
            <p>${post.text}</p>
            <button class="like-btn" onclick="handleLike(${post.id})">❤️ ${post.likes}</button>
            <button class="comment-btn" onclick="showComments(${post.id})">💬 ${post.comments.length}</button>
            <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
        `;
        postList.appendChild(div);
    });
}


// ===============================
// Profile Editing
// Allows users to update name, username, and profile picture
// ===============================
const editBtn = document.getElementById("edit-profile-btn");
const editForm = document.getElementById("edit-form-container");

if (editBtn) {
    editBtn.addEventListener("click", function () {

        editForm.classList.remove("hidden");
    });
}

const saveProfileBtn = document.getElementById("save-changes-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");


// ===============================
// Update Profile UI
// Displays user info: name, username, bio, posts count,
// followers count, and following count
// ===============================
function updateProfileUI() {
    const data = getData();
    const currentUser = localStorage.getItem("currentUser");
    const user = data.users.find(u => u.username === currentUser);

    if (user && document.getElementById("display-name")) {
        document.getElementById("display-name").textContent = user.name || user.username;
        document.getElementById("display-username").textContent = `@${user.username}`;
        document.getElementById("display-bio").textContent = user.bio || "No bio yet...";
        if (user.photo) document.getElementById("profile-pic").src = user.photo;

        // Update stats
        const userPosts = data.posts.filter(p => p.author === currentUser);
        document.getElementById("post-count").textContent = userPosts.length;
        
        document.getElementById("follower-count").textContent = user.followers.length;
        document.getElementById("following-count").textContent = user.following.length;
    }
}

if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", () => {
        const data = getData();
        const currentUser = localStorage.getItem("currentUser");
        const userIndex = data.users.findIndex(u => u.username === currentUser);

        // Update data object
        data.users[userIndex].photo = document.getElementById("input-photo").value;
        data.users[userIndex].name = document.getElementById("input-name").value;
        data.users[userIndex].username = document.getElementById("input-username").value;
        data.users[userIndex].bio = document.getElementById("input-bio").value;

        saveData(data);
        localStorage.setItem("currentUser", data.users[userIndex].username); // In case username changed
        location.reload();
    });
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
        document.getElementById("edit-form-container").classList.add("hidden");
    });
}


// ===============================
// Global Feed
// Shows posts from all users in reverse chronological order
// ===============================
function loadGlobalFeed() {
    const feedContainer = document.querySelector("main.feed");
    if (!feedContainer || window.location.pathname.includes("profile.html")) return;

    const data = getData();
    feedContainer.innerHTML = ""; // Clear static posts

        [...data.posts].reverse().forEach(post => { // Show newest first 
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.innerHTML = `
        <div class="post-header">

        <div class="author-info">
            <span class="author-name">${post.author}</span>
            <button class="follow-btn" onclick="toggleFollow('${post.author}')">Follow</button>
        </div>

        <span class="timestamp">Just now</span>
        </div>

        <div class="post-content">
            <p>${post.text}</p>
        </div>

        <div class="post-actions">
            <button class="like-btn" onclick="handleLike(${post.id})">❤️ ${post.likes}</button>
            <button class="comment-btn" onclick="toggleCommentBox(${post.id})">💬 ${post.comments.length}</button>
        </div>

        <div id="comment-box-${post.id}" class="hidden">
            <input type="text" id="comment-input-${post.id}" placeholder="Write comment">
            <button class="comment-btn" onclick="addComment(${post.id})">Comment</button>
        </div>

        <div id="comments-${post.id}">${post.comments.map(c=>`<p><strong>${c.author}</strong>: ${c.text}</p>`).join("")}</div>
        `;
        feedContainer.appendChild(postDiv);
    });
}


// ===============================
// Like Post
// Increases the like counter for a post
// ===============================
function handleLike(postId) {
    const data = getData();
    const post = data.posts.find(p => p.id === postId);
    if (post) {
        post.likes += 1;
        saveData(data);
        // Refresh UI based on which page we are on
        if (window.location.pathname.includes("feed.html")) loadGlobalFeed();
        else loadUserPosts();
    }
}


// ===============================
// Delete Post
// Removes a post created by the current user
// ===============================
function deletePost(postId){
const data = getData();
data.posts = data.posts.filter(p => p.id !== postId);

saveData(data);

loadUserPosts();
loadGlobalFeed();
}

// ===============================
// Comment System
// toggleCommentBox(): show/hide comment input
// addComment(): add a new comment to the post
// ===============================
function toggleCommentBox(postId){

const box = document.getElementById(`comment-box-${postId}`);
box.classList.toggle("hidden");

}


// ===============================
// Follow / Unfollow System
// Allows users to follow or unfollow other users
// ===============================
function toggleFollow(author){

const data = getData();
const currentUser = localStorage.getItem("currentUser");

if(author === currentUser) return;
const user = data.users.find(u => u.username === currentUser);

if(user.following.includes(author)){
user.following = user.following.filter(u => u !== author);

}else{
user.following.push(author);

}

saveData(data);
loadGlobalFeed();

}


function addComment(postId){

const input = document.getElementById(`comment-input-${postId}`);
const text = input.value;

if(text.trim()==="") return;
const data = getData();
const post = data.posts.find(p=>p.id===postId);

post.comments.push({
author: localStorage.getItem("currentUser"),
text: text
});

saveData(data);
input.value = "";
loadGlobalFeed();

}


// ===============================
// Page Initialization
// Runs specific functions depending on the current page
// ===============================

// Only run these if the elements exist on the current page
if (document.getElementById("user-posts-list")) {
    loadUserPosts();
}

if (document.getElementById("display-name")) {
    updateProfileUI();
}

if (document.querySelector("main.feed")) {
    loadGlobalFeed();
}

if (closeDetailBtn) {
    closeDetailBtn.addEventListener("click", () => {
        document.getElementById("post-detail").classList.add("hidden");
    });
}
