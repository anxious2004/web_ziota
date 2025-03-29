// Import Firebase functions
import { auth, provider, signInWithPopup, signOut } from "./firebase-config.js";

const API_BASE_URL = "http://localhost:5000"; 

// DOM Elements
const personalAccessBtn = document.getElementById("personalAccess");
const signOutBtn = document.getElementById("signOutBtn");
const authMessage = document.getElementById("authMessage");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("authForm");
const authOptions = document.getElementById("authOptions");
const registerOption = document.getElementById("registerOption");
const loginOption = document.getElementById("loginOption");

// ✅ Toggle Login & Register Options
personalAccessBtn.addEventListener("click", () => {
    authOptions.style.display = authOptions.style.display === "block" ? "none" : "block";
});

// ✅ Show Registration Form
registerOption.addEventListener("click", () => {
    registerForm.style.display = "block";
    loginForm.style.display = "none";
});

// ✅ Show Login Form
loginOption.addEventListener("click", () => {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
});

// ✅ Register User in MongoDB
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const registerBtn = registerForm.querySelector("button");

    if (!username || !email || !password) {
        authMessage.innerText = "❌ Please fill in all fields.";
        return;
    }

    registerBtn.disabled = true;
    registerBtn.innerText = "Registering...";

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            authMessage.innerText = "✅ Registration Successful! Please log in.";
            registerForm.style.display = "none";
            loginForm.style.display = "block";
        } else {
            authMessage.innerText = `❌ ${data.message || "Registration failed."}`;
        }
    } catch (error) {
        console.error("Registration Error:", error);
        authMessage.innerText = "⚠️ Server error. Please try again.";
    } finally {
        registerBtn.disabled = false;
        registerBtn.innerText = "Register";
    }
});

// ✅ Handle Login with MongoDB
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginBtn = loginForm.querySelector("button");

    if (!email || !password) {
        authMessage.innerText = "❌ Please enter email and password.";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerText = "Logging in...";

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token); // Store token securely

            authMessage.innerText = `✅ Welcome, ${data.user.username}!`;
            setTimeout(() => {
                window.location.href = "personal.html";
            }, 1000);
        } else {
            authMessage.innerText = `❌ ${data.message || "Invalid credentials"}`;
        }
    } catch (error) {
        console.error("Login Error:", error);
        authMessage.innerText = "⚠️ Server error. Please try again.";
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerText = "Login";
    }
});

// ✅ Google Login with Firebase (Only if user exists in MongoDB)
document.getElementById("googleLogin").addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const token = await user.getIdToken(); // Get Firebase token

        // Send token to backend to verify and check user existence
        const res = await fetch(`${API_BASE_URL}/auth/check-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok || !data.exists) {
            // Ask user to register if not found in MongoDB
            authMessage.innerText = "⚠️ User not found. Registering now...";
            
            await fetch(`${API_BASE_URL}/auth/register-firebase`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            authMessage.innerText = `✅ Welcome, ${user.displayName}! Redirecting...`;
            setTimeout(() => {
                window.location.href = "personal.html";
            }, 1500);
        } else {
            // User exists, proceed to login
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", token); // Store Firebase token

            authMessage.innerText = `✅ Welcome back, ${user.displayName}!`;
            setTimeout(() => {
                window.location.href = "personal.html";
            }, 1500);
        }
    } catch (error) {
        console.error("Google Login Error:", error);
        authMessage.innerText = "⚠️ Google Login Failed!";
    }
});

// ✅ Sign Out
signOutBtn.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            authMessage.innerText = "✅ Signed out!";
            localStorage.removeItem("user");
            localStorage.removeItem("token");

            signOutBtn.style.display = "none";
            personalAccessBtn.style.display = "block";
        })
        .catch((error) => console.error("Sign Out Error:", error));
});
