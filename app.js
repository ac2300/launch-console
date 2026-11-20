// Launch Console - app logic
const STORAGE_KEY = "launch-console-tasks";
const SETTINGS_KEY = "launch-console-settings";
const CATEGORIES = ["Product", "Marketing", "Legal", "Ops"];

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const categoryInput = document.getElementById("category-input");
const dueInput = document.getElementById("due-input");
const filters = document.getElementById("filters");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const progressFill = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");

let tasks = loadTasks();
let activeFilter = "All";

// Common launch tasks most early-stage startups need
const LAUNCH_TEMPLATE = [
  { title: "Define MVP feature list", category: "Product" },
  { title: "Run 5 user interviews", category: "Product" },
  { title: "Fix top bugs from beta testers", category: "Product" },
  { title: "Build landing page with waitlist", category: "Marketing" },
  { title: "Write launch announcement post", category: "Marketing" },
  { title: "Set up social media accounts", category: "Marketing" },
  { title: "Draft privacy policy and terms", category: "Legal" },
  { title: "Register business name / LLC", category: "Legal" },
  { title: "Set up analytics tracking", category: "Ops" },
  { title: "Create support email and FAQ", category: "Ops" },
];

const templateBtn = document.getElementById("template-btn");
const clearBtn = document.getElementById("clear-btn");
const launchDateInput = document.getElementById("launch-date");
const countdownEl = document.getElementById("countdown");
const statsEl = document.getElementById("category-stats");

let settings = loadSettings();

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // storage unavailable (e.g. private mode) - app still works for this session
  }
}

function addTask(title, category, due) {
  tasks.push({ id: Date.now().toString(), title, category, due: due || null, done: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
  saveTasks();
  render();
}

function renameTask(id, newTitle) {
  const title = newTitle.trim();
  if (!title) return render(); // empty name -> cancel edit
  tasks = tasks.map(t => (t.id === id ? { ...t, title } : t));
  saveTasks();
  render();
}

// Adds template tasks, skipping any the team already has
function loadTemplate() {
  const existing = new Set(tasks.map(t => t.title.toLowerCase()));
  let added = 0;
  LAUNCH_TEMPLATE.forEach((item, i) => {
    if (existing.has(item.title.toLowerCase())) return;
    tasks.push({ id: `${Date.now()}-${i}`, title: item.title, category: item.category, due: null, done: false });
    added++;
  });
  saveTasks();
  render();
  return added;
}

function clearCompleted() {
  const before = tasks.length;
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  render();
  return before - tasks.length;
}

function startEditing(li, task) {
  const titleEl = li.querySelector(".title");
  const editor = document.createElement("input");
  editor.className = "edit-input";
  editor.value = task.title;
  editor.maxLength = 120;
  let finished = false;
  const finish = save => {
    if (finished) return;
    finished = true;
    save ? renameTask(task.id, editor.value) : render();
  };
  editor.addEventListener("keydown", e => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  editor.addEventListener("blur", () => finish(true));
  titleEl.replaceWith(editor);
  editor.focus();
  editor.select();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function renderProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  progressFill.style.width = pct + "%";
  const ready = total > 0 && done === total;
  progressLabel.textContent = ready
    ? "100% ready - you're cleared for launch! 🚀"
    : `${pct}% ready (${done} of ${total} tasks done)`;
  progressLabel.classList.toggle("ready", ready);
}

// ---- date helpers ----
function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Unfinished tasks first, then soonest due date, tasks with no date last
function sortTasks(list) {
  return [...list].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.due && b.due) return a.due.localeCompare(b.due);
    if (a.due) return -1;
    if (b.due) return 1;
    return 0;
  });
}

// Whole days between today and the target launch date
function daysUntil(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

function renderCountdown() {
  countdownEl.classList.remove("late");
  if (!settings.launchDate) {
    countdownEl.textContent = "";
    return;
  }
  const days = daysUntil(settings.launchDate);
  const remaining = tasks.filter(t => !t.done).length;
  if (days > 0) {
    countdownEl.textContent = `${days} day${days === 1 ? "" : "s"} to launch · ${remaining} task${remaining === 1 ? "" : "s"} left`;
  } else if (days === 0) {
    countdownEl.textContent = "Launch day is today!";
  } else {
    countdownEl.textContent = `Launch date passed ${-days} day${days === -1 ? "" : "s"} ago`;
    countdownEl.classList.add("late");
  }
}

function renderStats() {
  statsEl.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const inCat = tasks.filter(t => (t.category || "Product") === cat);
    const done = inCat.filter(t => t.done).length;
    const pct = inCat.length ? Math.round((done / inCat.length) * 100) : 0;
    const box = document.createElement("div");
    box.className = "stat";
    box.innerHTML = `
      <div class="stat-name">${cat}</div>
      <div class="stat-count">${done}/${inCat.length}</div>
      <div class="mini-bar"><div class="mini-fill" style="width:${pct}%"></div></div>`;
    statsEl.appendChild(box);
  });
}

function render() {
  list.innerHTML = "";
  const visible = activeFilter === "All"
    ? tasks
    : tasks.filter(t => (t.category || "Product") === activeFilter);
  sortTasks(visible).forEach(task => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = task.title;
    title.title = "Double-click to rename";
    title.addEventListener("dblclick", () => startEditing(li, task));

    const tag = document.createElement("span");
    const category = task.category || "Product";
    tag.className = "tag " + category;
    tag.textContent = category;

    const due = document.createElement("span");
    due.className = "due";
    if (task.due) {
      const today = todayISO();
      due.textContent = "Due " + formatDate(task.due);
      if (!task.done && task.due < today) {
        due.classList.add("overdue");
        due.textContent = "Overdue · " + formatDate(task.due);
      } else if (!task.done && task.due === today) {
        due.classList.add("today");
        due.textContent = "Due today";
      }
    }

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, title, tag, due, del);
    list.appendChild(li);
  });
  emptyState.hidden = visible.length > 0;
  clearBtn.disabled = !tasks.some(t => t.done);
  emptyState.textContent = tasks.length === 0
    ? "No tasks yet. Add your first one above."
    : `No ${activeFilter} tasks.`;
  renderProgress();
  renderStats();
  renderCountdown();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  addTask(title, categoryInput.value, dueInput.value);
  input.value = "";
  dueInput.value = "";
  input.focus();
});

filters.addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  activeFilter = chip.dataset.filter;
  filters.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip));
  render();
});

launchDateInput.value = settings.launchDate || "";
launchDateInput.addEventListener("change", () => {
  settings.launchDate = launchDateInput.value || null;
  saveSettings();
  renderCountdown();
});

templateBtn.addEventListener("click", loadTemplate);
clearBtn.addEventListener("click", clearCompleted);

render();
