// script.js

let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
let lastSyncTime = localStorage.getItem("lastSyncTime") || null;

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const selectedCategory = categoryFilter.value;
  let filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" - ${filteredQuotes[randomIndex].category}`;
}

// Create Add Quote Form
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");
  formContainer.innerHTML = `
    <h3>Add a New Quote</h3>
    <form id="addQuoteForm">
      <input type="text" id="quoteText" placeholder="Enter quote" required />
      <input type="text" id="quoteCategory" placeholder="Enter category" required />
      <button type="submit">Add Quote</button>
    </form>
  `;

  document.getElementById("addQuoteForm").addEventListener("submit", (e) => {
    e.preventDefault();
    addQuote();
  });
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (text && category) {
    const newQuote = { text, category };

    quotes.push(newQuote);
    localStorage.setItem("quotes", JSON.stringify(quotes));

    populateCategories();
    showRandomQuote();

    document.getElementById("quoteText").value = "";
    document.getElementById("quoteCategory").value = "";
  }
}

// Populate Categories dynamically
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map((q) => q.category))];

  categoryFilter.innerHTML = categories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");

  // Restore last filter
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter && categories.includes(savedFilter)) {
    categoryFilter.value = savedFilter;
  }
}

// Filter quotes based on category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// -------- SERVER SYNC --------

// Simulate fetching quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // Convert fetched posts into quote-like objects
    const serverQuotes = data.slice(0, 5).map((item) => ({
      text: item.title,
      category: "server",
    }));

    handleServerSync(serverQuotes);
  } catch (error) {
    console.error("Error fetching from server:", error);
  }
}

// Handle syncing and conflict resolution
function handleServerSync(serverQuotes) {
  let updated = false;

  serverQuotes.forEach((sq) => {
    if (!quotes.some((q) => q.text === sq.text)) {
      quotes.push(sq);
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem("quotes", JSON.stringify(quotes));
    lastSyncTime = new Date().toISOString();
    localStorage.setItem("lastSyncTime", lastSyncTime);
    showNotification("Quotes updated from server. Conflicts resolved.");
    populateCategories();
  }
}

// Show notifications to the user
function showNotification(message) {
  notification.textContent = message;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Periodic Sync
setInterval(fetchQuotesFromServer, 15000); // every 15 seconds

// -------- INIT --------
window.onload = () => {
  populateCategories();
  showRandomQuote();
  createAddQuoteForm();
  fetchQuotesFromServer();
};
