console.log("app.js loaded");

document.querySelectorAll(".togglePassword").forEach((icon) => {
  icon.addEventListener("click", () => {
    const inputId = icon.getAttribute("data-target");
    const input = document.getElementById(inputId);
    if (input) {
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      icon.textContent = isPassword ? "🙈" : "👁️";
    }
  });
});

function checkAuth() {
  const session = JSON.parse(localStorage.getItem("session"));
  if (!session || session.expires < Date.now()) {
    localStorage.removeItem("session");
    window.location.href = "/pages/login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {

  if (document.body.classList.contains("protected")) {
    checkAuth();
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username  = document.getElementById("registerName").value.trim();
      const email     = document.getElementById("registerEmail").value.trim();
      const password  = document.getElementById("registerPassword").value;
      const confirm   = document.getElementById("registerConfirm").value;
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

      const email     = document.getElementById("loginEmail").value.trim();
      const password  = document.getElementById("loginPassword").value;
      const errorElem = document.getElementById("loginError");

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user  = users.find((u) => u.email === email && u.password === password);

      if (!user) {
        errorElem.textContent = "Invalid credentials";
        return;
      }

      const session = {
        email:    user.email,
        username: user.username,
        token:    Date.now(),
        expires:  Date.now() + 60 * 60 * 1000,
      };

      localStorage.setItem("session", JSON.stringify(session));
      window.location.href = "/pages/home.html";
    });
  }

  const logoutBtn    = document.getElementById("logoutBtn");
  const userInfo     = document.querySelector(".userInfo");
  const dropdownMenu = document.getElementById("dropdown_Menu");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("session");
      window.location.href = "/pages/login.html";
    });
  }

  if (userInfo && dropdownMenu) {
    userInfo.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".userDropdown")) {
        dropdownMenu.classList.remove("show");
      }
    });
  }

  const userEmailSpan = document.getElementById("userEmail");
  const session       = JSON.parse(localStorage.getItem("session"));
  if (userEmailSpan && session) {
    userEmailSpan.textContent = session.username || session.email;
  }

  const dropzone = document.getElementById("dropzone");
  if (!dropzone) return;

  const fileInput = document.createElement("input");
  fileInput.type          = "file";
  fileInput.accept        = ".jpg,.jpeg,.png,.md,.markdown,.txt";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) processFile(fileInput.files[0]);
    fileInput.value = "";
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", (e) => {
    if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove("dragover");
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  });

  const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".md", ".markdown", ".txt"];
  const IMAGE_EXTS   = [".jpg", ".jpeg", ".png"];

  async function processFile(file) {
    const ext = "." + file.name.split(".").pop().toLowerCase();

    if (!ALLOWED_EXTS.includes(ext)) {
      showResult("error", `Unsupported file: "${file.name}"\nAllowed: JPG, PNG, Markdown, TXT`);
      return;
    }

    setDropzoneLoading(`Analysing "${file.name}"…`);

    try {
      const yaml = IMAGE_EXTS.includes(ext)
        ? await classifyImage(file)
        : await classifyText(await readAsText(file), file.name);
      showResult("success", yaml);
    } catch (err) {
      console.error(err);
      showResult("error", "Classification failed:\n" + err.message);
    }
  }

  function readAsText(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload  = (e) => res(e.target.result);
      r.onerror = () => rej(new Error("Could not read file"));
      r.readAsText(file);
    });
  }

  function readAsBase64(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload  = (e) => res(e.target.result.split(",")[1]);
      r.onerror = () => rej(new Error("Could not read file"));
      r.readAsDataURL(file);
    });
  }

  async function classifyText(text, filename) {
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "text", text, filename }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${res.status}`);
    }
    const data = await res.json();
    return data.result;
  }

  async function classifyImage(file) {
    const base64    = await readAsBase64(file);
    const mimeType  = file.type || "image/jpeg";
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "image", base64, mimeType, filename: file.name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${res.status}`);
    }
    const data = await res.json();
    return data.result;
  }

  function setDropzoneLoading(msg) {
    dropzone.className = "dropzone loading";
    dropzone.innerHTML = `
      <div class="dz-inner">
        <div class="spinner"></div>
        <p>${msg}</p>
      </div>`;
  }

  function resetDropzone() {
    dropzone.className = "dropzone";
    dropzone.innerHTML = `
      <p>Drop your file here</p>
      <small>Supports JPG, PNG, Markdown</small>`;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function showResult(type, content) {
    let resultEl = document.getElementById("classifyResult");
    if (!resultEl) {
      resultEl = document.createElement("div");
      resultEl.id = "classifyResult";
      dropzone.parentElement.appendChild(resultEl);
    }

    if (type === "error") {
      resultEl.innerHTML = `
        <div class="result-box result-error">
          <p class="result-label">⚠ Error</p>
          <pre>${escapeHtml(content)}</pre>
        </div>`;
    } else {
      resultEl.innerHTML = `
        <div class="result-box result-success">
          <div class="result-header">
            <span class="result-label">✦ Classification</span>
            <button class="copy-btn" id="copyYaml">Copy YAML</button>
          </div>
          <pre class="yaml-output">${escapeHtml(content)}</pre>
        </div>`;

      document.getElementById("copyYaml").addEventListener("click", function () {
        navigator.clipboard.writeText(content).then(() => {
          this.textContent = "Copied!";
          setTimeout(() => (this.textContent = "Copy YAML"), 2000);
        });
      });
    }

    resetDropzone();
  }

});
