const STORAGE_KEY = "meta2026.goals.v1";

const form = document.getElementById("goalForm");
const input = document.getElementById("goalInput");
const list = document.getElementById("goalList");
const emptyState = document.getElementById("emptyState");

const statTotal = document.getElementById("statTotal");
const statDone = document.getElementById("statDone");
const statPending = document.getElementById("statPending");

const btnClearDone = document.getElementById("btnClearDone");
const btnClearAll = document.getElementById("btnClearAll");

const filterButtons = document.querySelectorAll(".chip");

let filter = "all"; // all | pending | done
let goals = loadGoals();

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGoals() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

function setFilter(next) {
  filter = next;
  filterButtons.forEach((b) => b.classList.toggle("active", b.dataset.filter === next));
  render();
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  goals.unshift({
    id: uid(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
  });

  input.value = "";
  saveGoals();
  render();
});

btnClearDone.addEventListener("click", () => {
  goals = goals.filter((g) => !g.done);
  saveGoals();
  render();
});

btnClearAll.addEventListener("click", () => {
  goals = [];
  saveGoals();
  render();
});

function toggleGoal(id) {
  goals = goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
  saveGoals();
  render();
}

function removeGoal(id) {
  goals = goals.filter((g) => g.id !== id);
  saveGoals();
  render();
}

function visibleGoals() {
  if (filter === "done") return goals.filter((g) => g.done);
  if (filter === "pending") return goals.filter((g) => !g.done);
  return goals;
}

function renderStats() {
  const total = goals.length;
  const done = goals.filter((g) => g.done).length;
  const pending = total - done;

  statTotal.textContent = total;
  statDone.textContent = done;
  statPending.textContent = pending;
}

function render() {
  renderStats();

  const shown = visibleGoals();
  list.innerHTML = "";

  emptyState.hidden = shown.length !== 0;

  for (const g of shown) {
    const li = document.createElement("li");
    li.className = `item ${g.done ? "done" : ""}`;

    const check = document.createElement("button");
    check.className = "check";
    check.type = "button";
    check.title = g.done ? "Marcar como pendente" : "Marcar como concluída";
    check.setAttribute("aria-label", check.title);
    check.textContent = g.done ? "✓" : "";
    check.addEventListener("click", () => toggleGoal(g.id));

    const textWrap = document.createElement("div");
    textWrap.className = "text";

    const goalText = document.createElement("div");
    goalText.className = "goal";
    goalText.textContent = g.text;

    const meta = document.createElement("div");
    meta.className = "meta";
    const date = new Date(g.createdAt).toLocaleDateString("pt-BR");
    meta.textContent = `Criada em ${date}`;

    textWrap.appendChild(goalText);
    textWrap.appendChild(meta);

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.textContent = "Remover";
    remove.addEventListener("click", () => removeGoal(g.id));

    li.appendChild(check);
    li.appendChild(textWrap);
    li.appendChild(remove);

    list.appendChild(li);
  }
}

render();
