"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);


  // ============================
  // Dark Mode
  // ============================

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const saved = localStorage.getItem("darkMode");

    if (saved === "enabled" || (!saved && prefersDark)) {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle("dark-mode", next);
    localStorage.setItem("darkMode", next ? "enabled" : "disabled");
  }


  // ============================
  // Toast
  // ============================

  function showToast(message, type = "info") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }


  // ============================
  // Sign Up
  // ============================

  async function handleSignup(e) {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (password.length < 8 || !hasLetter || !hasNumber) {
      showToast(
        "Use a strong password: at least 8 characters with letters and numbers.", "error"
      );
      return;
    }

    const res = await fetch("/api/users");
    const users = await res.json();

    const existingUser = users.find(u => u.username === trimmedUsername);
    if (existingUser) {
      showToast("Username already exists.", "error");
      return;
    }

    const newUser = {
      username: trimmedUsername,
      email: trimmedEmail,
      password: password,
      name: trimmedUsername,
      bio: "",
      photo: "",
      followers: [],
      following: [],
    };

    const createRes = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (createRes.ok) {
      showToast("Account created successfully.", "success");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } else {
      showToast("Something went wrong. Please try again.", "error");
    }
  }


  // ============================
  // Render
  // ============================

  return (
    <>
      {toast && (
        <div className={`custom-toast ${toast.type} show`}>
          {toast.message}
        </div>
      )}

      <header>
        <div className="nav-container">
          <div className="logo-section">
            <img src="/logo.png" className="logo" alt="Logo"/>
            <h1 className="site-name">Bookworms</h1>
          </div>
        </div>
      </header>

      <main className="signup-container">

        <h2>Create your Bookworms Account📜</h2>

        <form onSubmit={handleSignup}>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required/>

          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required/>

          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" placeholder="Enter a strong password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required/>
          <small className="input-note">Password must be at least 8 characters long.</small>
          
          <button type="submit">Sign Up</button>
        </form>

        <p className="login-link"> Already have an account? <a href="/login">Log in</a></p>

      </main>

      <footer>
        <p>&copy; 2026 Bookworms. All rights reserved.</p>
      </footer>
    </>
  );
}