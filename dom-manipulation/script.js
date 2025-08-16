/* =========================================
   Dynamic Quote Generator — script.js
   - LocalStorage + SessionStorage
   - Add / Filter / Random display
   - JSON Import / Export
   - Server Sync + Conflict Resolution
   ========================================= */

// --------------------
// Config
// --------------------
const LS_QUOTES_KEY = "quotes";
const LS_SELECTED_CATEGORY_KEY = "selectedCategory";
const SS_LAST_QUOTE_KEY = "lastQuote";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock server
const SYNC_INTERVAL_MS = 30000; // 30s periodic sync

// --------------------
// State
// --------------------
let quotes = []; // [{ text, category }]

// --------------------
// Storage helpers
// --------------------
function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem(LS_QUOTES_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        quotes = parsed;
      } else {
        quotes = [];
      }
    } catch {
      quotes = [];
    }
  }

  // Fallback defaults if empty
  if (quotes.length === 0) {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
      { text: "Life is what happens when you’re busy making other plans.", category: "Life" }
    ];
    saveQuotes();
  }
}

// --------------------
// DOM helpers (safe getters)
// --------------------
function byId(id) {
  return document.getElementById(id) || null;
}

function getQuoteDisplayEl() {
  return byId("quoteDisplay");
}

function getCategoryFilterEl() {
  return byId("categoryFilter");
}

function getNotificationEl() {
  return byId("notification");
}

// Supports both sets of IDs used across tasks/specs
function getTextInputEl() {
  return byId("quoteText") || byId("newQuoteText");
}
function getCategoryInputEl() {
  return byId("quoteCategory") || byId("newQuoteCategory");
}

// --------------------
// UI: Notifications
// --------------------
function notifyUser(message) {
  const n = getNotificationEl();
  if (!n) return; // silently skip if not present
  n.textContent = message;
  n.style.display = "block";
  // Accessible live region
  n.setAttribute("role", "status");
  n.setAttribute("aria-live", "polite");
  setTimeout(() => (n.style.display = "none"), 4000);
}

// --------------------
// Populate categories
// --------------------
function populateCategories() {
  const select = getCategoryFilterEl();
  if (!select) return;

  const unique = [...new Set(quotes.map(q => q.category))].sort((a, b) =>
    a.localeCompare(b)
  );

  select.innerHTML = '<option value="all">All Categories</option>';
  unique.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  // restore last selected
  const last = localStorage.getItem(LS_SELECTED_CATEGORY_KEY) || "all";
  select.value = last;
}

// --------------------
// Display a random quote (supports filtering)
// --------------------
function displayRandomQuote(filteredQuotes = quotes) {
  const container = getQuoteDisplayEl();
  if (!container) return;

  if (!Array.isArray(filteredQuotes) || filteredQuotes.length === 0) {
    container.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length); // Math.random usage required
  const q = filteredQuotes[randomIndex];
  container.textContent = `"${q.text}" — [${q.category}]`;

  // keep last viewed quote in session storage
  sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(q));
}

// Wrapper if you need a named function for “Show New Quote” button
function showRandomQuote() {
  const select = getCategoryFilterEl();
  if (select && select.value !== "all") {
    const filtered = quotes.filter(q => q.category === select.value);
    displayRandomQuote(filtered);
  } else {
    displayRandomQuote(quotes);
  }
}

// --------------------
// Filtering
// --------------------
function filterQuotes() {
  const select = getCategoryFilterEl();
  if (!select) return;

  const selected = select.value;
  localStorage.setItem(LS_SELECTED_CATEGORY_KEY, selected);

  if (selected === "all") {
    displayRandomQuote(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selected);
    displayRandomQuote(filtered);
  }
}

// --------------------
// Add Quote
// --------------------
function addQuote() {
  const textEl = getTextInputEl();
  const catEl = getCategoryInputEl();
  if (!textEl || !catEl) {
    alert("Quote input fields not found in the DOM.");
    return;
  }

  const text = textEl.value.trim();
  const category = catEl.value.trim();
  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories(); // in case it's a new category
  filterQuotes();       // refresh the display according to current filter

  textEl.value = "";
  catEl.value = "";
  notifyUser("Quote added successfully.");
}

// --------------------
// Optional: Create Add Quote Form dynamically
// (used if your HTML doesn't include the inputs)
// --------------------
function createAddQuoteForm() {
  // If either input exists, don't duplicate the UI
  if (getTextInputEl() || getCategoryInputEl()) return;

  const container = document.createElement("div");
  container.style.marginBlock = "1rem";

  const text = document.createElement("input");
  text.type = "text";
  text.id = "quoteText";
  text.placeholder = "Enter a new quote";
  text.style.marginRight = "0.5rem";

  const category = document.createElement("input");
  category.type = "text";
  category.id = "quoteCategory";
  category.placeholder = "Enter quote category";
  category.style.marginRight = "0.5rem";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.addEventListener("click", addQuote);

  container.appendChild(text);
  container.appendChild(category);
  container.appendChild(btn);

  // Try to append near quote display; else append to body
  const display = getQuoteDisplayEl();
  if (display && display.parentElement) {
    display.parentElement.appendChild(container);
  } else {
    document.body.appendChild(container);
  }
}

// --------------------
// JSON Export / Import
// --------------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  notifyUser("Quotes exported as quotes.json");
}

function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        alert("Invalid file format. Expected an array of quotes.");
        return;
      }
      // Basic shape validation
      const cleaned = imported
        .filter(q => q && typeof q.text === "string" && typeof q.category === "string")
        .map(q => ({ text: q.text.trim(), category: q.category.trim() }))
        .filter(q => q.text && q.category);

      // Merge without duplicates (by text)
      const merged = mergeQuotes(quotes, cleaned);
      quotes = merged;
      saveQuotes();
      populateCategories();
      filterQuotes();
      notifyUser("Quotes imported successfully.");
    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };
  reader.readAsText(file);
}

// --------------------
// Server Sync + Conflict Resolution
// Strategy: "Server wins" on duplicates (by text)
// --------------------
function mergeQuotes(localQuotes, incomingQuotes) {
  // Priority for incoming (server) on duplicates by `text`
  const map = new Map();

  // First, set all incoming (server) — so they win on collisions
  incomingQuotes.forEach(q => map.set(q.text, { text: q.text, category: q.category }));

  // Then add locals if missing
  localQuotes.forEach(q => {
    if (!map.has(q.text)) {
      map.set(q.text, { text: q.text, category: q.category });
    }
  });

  return Array.from(map.values());
}

async function syncWithServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    // Convert server "posts" to quotes format
    const serverQuotes = (Array.isArray(data) ? data.slice(0, 10) : []).map(post => ({
      text: String(post.title || "").trim(),
      category: "server"
    })).filter(q => q.text);

    const beforeCount = quotes.length;
    quotes = mergeQuotes(quotes, serverQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();

    const afterCount = quotes.length;
    if (afterCount > beforeCount) {
      notifyUser("Synced with server. New quotes added.");
    } else {
      notifyUser("Synced with server. No changes.");
    }
  } catch (e) {
    console.error("Sync error:", e);
    // No hard alert to avoid annoyance; just log
  }
}

// Manual sync wrapper for a button
function manualSync() {
  syncWithServer();
}

// --------------------
// Initialization
// --------------------
function initEventBindings() {
  // Show new random quote button (if present)
  const newQuoteBtn = byId("newQuote");
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener("click", showRandomQuote);
  }

  // Category filter (if present)
  const categoryFilter = getCategoryFilterEl();
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterQuotes);
  }

  // Add quote button (if present & not using inline onclick)
  const addBtn = byId("addQuoteBtn");
  if (addBtn) {
    addBtn.addEventListener("click", addQuote);
  }

  // Export button
  const exportBtn = byId("exportJson");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportToJsonFile);
  }

  // Import input
  const importInput = byId("importFile");
  if (importInput) {
    importInput.addEventListener("change", importFromJsonFile);
  }

  // Manual sync button
  const syncBtn = byId("syncNow");
  if (syncBtn) {
    syncBtn.addEventListener("click", manualSync);
  }
}

function init() {
  loadQuotes();
  populateCategories();

  // Restore last viewed quote if available
  const last = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
  if (last) {
    try {
      const q = JSON.parse(last);
      const display = getQuoteDisplayEl();
      if (display && q && q.text && q.category) {
        display.textContent = `"${q.text}" — [${q.category}]`;
      } else {
        filterQuotes(); // fallback
      }
    } catch {
      filterQuotes();
    }
  } else {
    filterQuotes();
  }

  // Create add-quote form dynamically if your HTML doesn’t include it
  createAddQuoteForm();

  initEventBindings();

  // Start periodic sync
  setInterval(syncWithServer, SYNC_INTERVAL_MS);
  // Do an initial sync shortly after load (non-blocking)
  setTimeout(syncWithServer, 500);
}

// Boot
document.addEventListener("DOMContentLoaded", init);
