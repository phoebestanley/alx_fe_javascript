// Load quotes from localStorage or start with an empty array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Reset dropdown (keep "All Categories")
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category from localStorage
  const lastSelected = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = lastSelected;
}

// Display quotes
function displayQuotes(filteredQuotes = quotes) {
  const quoteList = document.getElementById("quoteList");
  quoteList.innerHTML = "";

  filteredQuotes.forEach((quote, index) => {
    const li = document.createElement("li");
    li.textContent = `"${quote.text}" - [${quote.category}]`;
    quoteList.appendChild(li);
  });
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    filterQuotes(); // refresh display
    document.getElementById("quoteText").value = "";
    document.getElementById("quoteCategory").value = "";
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  if (selectedCategory === "all") {
    displayQuotes(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selectedCategory);
    displayQuotes(filtered);
  }
}

// Initialize app
function init() {
  populateCategories();
  filterQuotes(); // show filtered (or all) quotes on load
}

init();
