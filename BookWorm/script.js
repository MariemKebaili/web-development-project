if (!localStorage.getItem("bookwormData")) {
    const initialData = {
        users:[],
        posts:[]
};
    localStorage.setItem("bookwormData", JSON.stringify(initialData));
}

function getData() {
    const data = localStorage.getItem("bookwormData");
    return data ? JSON.parse(data) : { users: [], posts: [] };
}

function saveData(data) {
    localStorage.setItem("bookwormData", JSON.stringify(data));
}

const signupForm = document.getElementById("signup-form");

if (signupForm) {

    signupForm.addEventListener("submit", function(e) {

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

const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", function(e) {
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

const postBtn = document.getElementById('post-btn');

if (postBtn) {

    postBtn.addEventListener("click", function() {
        const postText = document.getElementById("post-input").value;

        if (postText.trim() === "") return;

        const data = getData();
        const currentUser = localStorage.getItem("currentUser");

        const newPost = {
            id: Date.now(),
            author: currentUser,
            text: postText,
            likes: 0,
            comments: []
        };

        data.posts.push(newPost);
        saveData(data);

        alert("Post created!");

        location.reload();
    });
}

function loadUserPosts(){
    const postList = document.getElementById("user-posts-list");

    if (!postList) return;

    const data = getData();
    const currentUser = localStorage.getItem("currentUser");

    postList.innerHTML = "";

    const userPosts = data.posts.filter(p => p.author === currentUser);

    if (userPosts.length === 0){
        postList.innerHTML = "<p>No posts yet. Start your favorite qoutes!</p>";
        return;
    }

    userPosts.forEach(post => {
        const div = document.createElement("div");

        div.classList.add("post");

        div.innerHTML = `
            <p>${post.text}</p>
            <div class="post-actions">
                <button class="like-btn" onclick="handleLike(${post.id})">❤️ ${post.likes}</button>
                <button class="comment-btn">💬 ${post.comments.length}</button>
                <button class="delete-btn" onclick="handleDelete(${post.id})">Delete</button>
            <div>
        `;
        postList.appendChild(div);
    });
}

const editBtn = document.getElementById("edit-profile-btn");
const editForm = document.getElementById("edit-form-container");

if(editBtn){
    editBtn.addEventListener("click", function() {

        editForm.classList.remove("hidden");
    });
}

const saveProfileBtn = document.getElementById("save-changes-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

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

function loadGlobalFeed() {
    const feedContainer = document.querySelector("main.feed");
    if (!feedContainer || window.location.pathname.includes("profile.html")) return;

    const data = getData();
    feedContainer.innerHTML = ""; // Clear static posts

    data.posts.reverse().forEach(post => { // Show newest first
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.innerHTML = `
            <div class="post-header">
                <span class="author-name">${post.author}</span>
                <span class="timestamp">Just now</span>
            </div>
            <div class="post-content"><p>${post.text}</p></div>
            <div class="post-actions">
                <button class="like-btn" onclick="handleLike(${post.id})">❤️ ${post.likes}</button>
                <button class="comment-btn">💬 ${post.comments.length}</button>
            </div>
        `;
        feedContainer.appendChild(postDiv);
    });
}

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

// --- DELETE LOGIC ---
function handleDelete(postId) {
    if (confirm("Are you sure you want to delete this post?")) {
        const data = getData();
        // Remove the post from the array
        data.posts = data.posts.filter(p => p.id !== postId);
        
        saveData(data);
        loadUserPosts();   // Refresh the list
        updateProfileUI(); // Refresh the post count stat
    }
}

// --- VIEW DETAIL LOGIC ---
function viewPostDetail(postId) {
    const data = getData();
    const post = data.posts.find(p => p.id === postId);
    const detailView = document.getElementById("post-detail");

    if (post && detailView) {
        document.getElementById("detail-text").textContent = post.text;
        detailView.classList.remove("hidden");

        // Load existing comments
        const commentsList = document.getElementById("comments-list");
        commentsList.innerHTML = post.comments.map(c => `<p class="comment-item">${c}</p>`).join('');

        // Setup the "Add Comment" button for this specific post
        document.getElementById("add-comment-btn").onclick = function() {
            const commentInput = document.getElementById("comment-input");
            if (commentInput.value.trim() !== "") {
                post.comments.push(commentInput.value);
                saveData(data);
                commentInput.value = "";
                viewPostDetail(postId); // Refresh the modal view
                loadUserPosts(); // Refresh the count on the main list
            }
        };
    }
}

// --- CLOSE DETAIL VIEW ---
const closeDetailBtn = document.getElementById("close-detail-btn");
if (closeDetailBtn) {
    closeDetailBtn.addEventListener("click", () => {
        document.getElementById("post-detail").classList.add("hidden");
    });
}

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
