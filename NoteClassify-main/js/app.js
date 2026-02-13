console.log("For home page");

// ---------------------------Changes------------------------------ <-
document.addEventListener("DOMContentLoaded",() => {
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirm = document.getElementById("registerConfirm").value;
        const errorElem = document.getElementById("registerError");

        if (!email || !password || !confirm) {
            errorElem.textContent = "Please fill out all fields";
        return;
        }

        if (password.length < 8) {
            errorElem.textContent = "Password must be 8 characters or more";
        return;
        }

        if (password !== confirm) {
            errorElem.textContent = "Passwords does not match";
        return;
        }

        const users = JSON.parse(localStorage.getItem("users") || "[]");

        if (users.some((u) => u.username?.toLowerCase() === username.toLowerCase())) {
            errorElem.textContent = "Username is already taken";
            return;
        }

        if (users.some((u) => u.email === email)) {
            errorElem.textContent = "Email is already registered";
            return;
        }

        users.push({ username, email, password });
        localStorage.setItem("users", JSON.stringify(users));

        window.location.href = "/pages/login.html";
        });
    }

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const errorElem = document.getElementById("loginError");

        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find((u) => u.email === email && u.password === password);

        if (!user) {
            errorElem.textContent = "Invalid credentials";
        return;
        }

        const session = {
            email: user.email,
            token: Date.now(),
            expires: Date.now() + 60 * 60 * 1000,
        };

        localStorage.setItem("session", JSON.stringify(session));
        window.location.href = "/pages/home.html";
        });
    }
});

function checkAuth(){
    const session = JSON.parse(localStorage.getItem("session"));

    if (!session||session.expires < Date.now()){
        localStorage.removeItem("session");
        window.location.href = "/pages/login.html";
    }
}

document.addEventListener("DOMContentLoaded",() => {
    if (document.body.classList.contains("protected")) {
        checkAuth();
    }
});

document.addEventListener("DOMContentLoaded",() =>{
    const logoutBtn = document.getElementById("logoutBtn");
    const userInfo = document.querySelector(".userInfo");
    const dropdownMenu = document.getElementById("dropdown_Menu");

    if (logoutBtn) {
        logoutBtn.addEventListener("click",() => {
        localStorage.removeItem("session");
        window.location.href = "/pages/login.html";
    });
    }

    if (userInfo && dropdownMenu) {
        userInfo.addEventListener("click",(e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle("show");
        });

        document.addEventListener("click",(event) => {
        if (!event.target.closest(".userDropdown")) {
            dropdownMenu.classList.remove("show");
        }
        });
    }
});

document.addEventListener("DOMContentLoaded",() => {
    const userEmailSpan = document.getElementById("userEmail");
    const session = JSON.parse(localStorage.getItem("session"));

    if (userEmailSpan && session?.email) {
        userEmailSpan.textContent = session.email;
    }
});




document.querySelectorAll(".togglePassword").forEach((icon) => {
  icon.addEventListener("click", () => {
    const inputId = icon.getAttribute("data-target");
    const input = document.getElementById(inputId);

    if (input) {
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      icon.textContent = isPassword ? "" : ""; // Optional: switch icon
    }
  });
});
