// script.js - Dynamic Quote Generator with Sync & Conflict Resolution

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation", id: 1 },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom", id: 2 },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Resilience", id: 3 }
];

const serverURL = "https://jsonplaceholder.typicode.com/posts"; // Mock server
const quoteList = document.getElementById("quoteList");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");
const conflictBox = document.getElementById("conflictBox");
const addQuoteForm = document.getElementById("addQuoteForm");
const quoteText = document.getElementById("quoteText");
const quoteCategory = document.getElementById("quoteCategory");

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Render quotes
function displayQuotes(quotesToDisplay) {
  quoteList.innerHTML = "";
  quotesToDisplay.forEach((q) => {
    const li = document.createElement("li");
    li.textContent = `${q.text} (${q.category})`;
    quoteList.appendChild(li);
  });
}

// Populate categories dynamically
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = "";
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const lastFilter = localStorage.getItem("lastFilter") || "all";
  categoryFilter.value = lastFilter;
  filterQuotes();
}

// Filter quotes by category
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastFilter", selected);
  if (selected === "all") {
    displayQuotes(quotes);
  } else {
    displayQuotes(quotes.filter((q) => q.category === selected));
  }
}

// Add new quote
function addQuote(text, category) {
  const newQuote = { text, category, id: Date.now() };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  syncQuoteWithServer(newQuote); // Push new quote to server
}

// --- Server Sync Section ---

// Fetch quotes from server
async function fetchFromServer() {
  try {
    const res = await fetch(serverURL);
    const serverData = await res.json();

    // Simulate server holding quote objects
    const serverQuotes = serverData.slice(0, 5).map((d) => ({
      id: d.id,
      text: d.title,
      category: "Server"
    }));

    resolveConflicts(serverQuotes);
  } catch (err) {
    console.error("Error fetching from server:", err);
  }
}

// Push a quote to server (simulation)
async function syncQuoteWithServer(quote) {
  try {
    await fetch(serverURL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error syncing quote:", err);
  }
}

// Conflict resolution: ask user if both exist with different text
function resolveConflicts(serverQuotes) {
  let updated = false;

  serverQuotes.forEach((sQuote) => {
    const localQuote = quotes.find((q) => q.id === sQuote.id);

    if (!localQuote) {
      quotes.push(sQuote);
      updated = true;
    } else if (localQuote.text !== sQuote.text) {
      // Conflict found: show options to user
      showConflict(localQuote, sQuote);
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification("Quotes updated from server.");
  }
}

// Show notification
function showNotification(msg) {
  notification.textContent = msg;
  notification.style.display = "block";
  setTimeout(() => (notification.style.display = "none"), 4000);
}

// Conflict box with manual resolution
function showConflict(localQuote, serverQuote) {
  conflictBox.innerHTML = `
    <p><b>Conflict detected!</b></p>
    <p>Local: "${localQuote.text}" (${localQuote.category})</p>
    <p>Server: "${serverQuote.text}" (${serverQuote.category})</p>
    <button id="keepLocal">Keep Local</button>
    <button id="keepServer">Keep Server</button>
  `;
  conflictBox.style.display = "block";

  document.getElementById("keepLocal").onclick = () => {
    conflictBox.style.display = "none";
    showNotification("Kept local version.");
  };

  document.getElementById("keepServer").onclick = () => {
    // Replace local with server
    quotes = quotes.map((q) => (q.id === localQuote.id ? serverQuote : q));
    saveQuotes();
    populateCategories();
    filterQuotes();
    conflictBox.style.display = "none";
    showNotification("Replaced with server version.");
  };
}

// Periodic sync every 15s
setInterval(fetchFromServer, 15000);

// Event listeners
categoryFilter.addEventListener("change", filterQuotes);

addQuoteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (quoteText.value.trim() && quoteCategory.value.trim()) {
    addQuote(quoteText.value.trim(), quoteCategory.value.trim());
    quoteText.value = "";
    quoteCategory.value = "";
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  filterQuotes();
  fetchFromServer();
});
