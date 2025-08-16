// script.js

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// =================== DOM UPDATES ===================
function displayQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  let filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerText = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerText = `"${filteredQuotes[randomIndex].text}" (${filteredQuotes[randomIndex].category})`;
}

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
    if (cat === selectedCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayQuote();
}

// =================== ADD NEW QUOTES ===================
function addQuote(text, category) {
  const newQuote = { text, category };

  // Save locally
  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  displayQuote();

  // Sync with server (POST)
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newQuote)
  })
  .then(response => response.json())
  .then(data => {
    console.log("Quote synced with server:", data);
    showNotification("Quote added and synced with server.");
  })
  .catch(err => {
    console.error("Error posting to server:", err);
    showNotification("Quote added locally but failed to sync with server.");
  });
}

// =================== SERVER SYNC ===================
function fetchQuotesFromServer() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(serverQuotes => {
      const serverFormatted = serverQuotes.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server"
      }));

      let localTexts = new Set(quotes.map(q => q.text));
      let newOnes = serverFormatted.filter(q => !localTexts.has(q.text));

      if (newOnes.length > 0) {
        quotes = [...quotes, ...newOnes];
        localStorage.setItem("quotes", JSON.stringify(quotes));
        populateCategories();
        displayQuote();
        showNotification("New quotes synced from server.");
      }
    })
    .catch(err => console.error("Error fetching from server:", err));
}

function showNotification(message) {
  const notif = document.getElementById("notification");
  notif.innerText = message;
  notif.style.display = "block";
  setTimeout(() => notif.style.display = "none", 4000);
}

// =================== INIT ===================
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  displayQuote();

  // Auto sync every 15s
  setInterval(fetchQuotesFromServer, 15000);

  // Add sample form for new quotes
  const formContainer = document.getElementById("formContainer");
  formContainer.innerHTML = `
    <input type="text" id="quoteText" placeholder="Enter new quote">
    <input type="text" id="quoteCategory" placeholder="Enter category">
    <button onclick="addQuote(document.getElementById('quoteText').value, document.getElementById('quoteCategory').value)">
      Add Quote
    </button>
  `;
});
