let quotes = [];

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" }
    ];
    saveQuotes();
  }
  populateCategories();
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
}

// Display random quote
function displayRandomQuote() {
  if (quotes.length === 0) return;

  const filter = document.getElementById("categoryFilter").value;
  let filteredQuotes = quotes;

  if (filter !== "all") {
    filteredQuotes = quotes.filter(q => q.category === filter);
  }

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById("quoteDisplay").innerText = `"${quote.text}" — ${quote.category}`;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Restore last viewed quote (session-based)
function loadLastViewedQuote() {
  const lastQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").innerText = `"${quote.text}" — ${quote.category}`;
  }
}

// Add Quote Form
document.getElementById("addQuoteForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    document.getElementById("quoteText").value = "";
    document.getElementById("quoteCategory").value = "";
    alert("Quote added successfully!");
  }
});

// Populate category filter dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Filter quotes by category (on change)
function filterByCategory() {
  displayRandomQuote();
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Expected an array of quotes.");
      }
    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize app
window.onload = function() {
  loadQuotes();
  loadLastViewedQuote();
};
