const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const taskCount = document.getElementById("task-count");
const statusBar = document.getElementById("status-bar");

// ─── Auth helpers ──────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("qmax_token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + getToken(),
  };
}

function logout() {
  localStorage.removeItem("qmax_token");
  window.location.href = "/";
}

// Redirect to login if not authenticated
if (!getToken()) {
  window.location.href = "/";
}

// ─── Render tasks ──────────────────────────────────────────────
function renderTask(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;
  li.textContent = task.text;
  if (task.checked) li.classList.add("checked");

  const span = document.createElement("span");
  span.textContent = "×";
  span.onclick = async (e) => {
    e.stopPropagation();
    await deleteTask(task.id, li);
  };

  li.appendChild(span);
  li.addEventListener("click", () => toggleTask(task.id, li));
  listContainer.appendChild(li);
}

function updateCount() {
  const all = listContainer.querySelectorAll("li").length;
  const done = listContainer.querySelectorAll("li.checked").length;
  taskCount.textContent = `${done} of ${all} tasks completed`;
  statusBar.style.display = all > 0 ? "flex" : "none";
}

// ─── Load all tasks from API ───────────────────────────────────
async function loadTasks() {
  try {
    const res = await fetch("/api/tasks", { headers: authHeaders() });

    if (res.status === 401 || res.status === 403) {
      logout();
      return;
    }

    const data = await res.json();
    listContainer.innerHTML = "";
    data.tasks.forEach(renderTask);
    updateCount();
  } catch (err) {
    console.error("Failed to load tasks:", err);
  }
}

// ─── Add task ─────────────────────────────────────────────────
async function addTask() {
  const text = inputBox.value.trim();
  if (!text) {
    inputBox.style.border = "2px solid #ff5945";
    setTimeout(() => (inputBox.style.border = ""), 600);
    return;
  }

  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ text: text.charAt(0).toUpperCase() + text.slice(1) }),
    });

    if (res.ok) {
      const data = await res.json();
      renderTask(data.task);
      inputBox.value = "";
      inputBox.focus();
      updateCount();
    }
  } catch (err) {
    console.error("Failed to add task:", err);
  }
}

// ─── Toggle checked ───────────────────────────────────────────
async function toggleTask(id, li) {
  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: authHeaders(),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.checked) {
        li.classList.add("checked");
      } else {
        li.classList.remove("checked");
      }
      updateCount();
    }
  } catch (err) {
    console.error("Failed to toggle task:", err);
  }
}

// ─── Delete task ──────────────────────────────────────────────
async function deleteTask(id, li) {
  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (res.ok) {
      li.remove();
      updateCount();
    }
  } catch (err) {
    console.error("Failed to delete task:", err);
  }
}

// ─── Enter key to add ─────────────────────────────────────────
inputBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// ─── Init ─────────────────────────────────────────────────────
loadTasks();
