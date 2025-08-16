// Load quotes from localStorage or start with an empty array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories dynamically in the dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  // Get unique categories from quotes
  const categories = [...new Set(quotes.map(q => q.category))];

  // Reset dropdown (always keep "All Categories" option)
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

// Display ONE random quote in the quoteDisplay container
function displayRandomQuote(filteredQuotes = quotes) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = `"${randomQuote.text}" - [${randomQuote.category}]`;
  } else {
    quoteDisplay.textContent = "No quotes available in this category.";
  }
}

// Add a new quote with text + category
function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    filterQuotes(); // refresh random display
    document.getElementById("quoteText").value = "";
    document.getElementById("quoteCategory").value = "";
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Filter quotes by category and display a random one
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  if (selectedCategory === "all") {
    displayRandomQuote(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selectedCategory);
    displayRandomQuote(filtered);
  }
}

// Initialize the app
function init() {
  populateCategories();
  filterQuotes(); // show filtered (or all) random quote on load
}

// Run initialization
init();
