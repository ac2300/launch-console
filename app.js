// Launch Console - app logic
const STORAGE_KEY = "launch-console-tasks";

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
  emptyState.textContent = tasks.length === 0
    ? "No tasks yet. Add your first one above."
    : `No ${activeFilter} tasks.`;
  renderProgress();
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

render();
