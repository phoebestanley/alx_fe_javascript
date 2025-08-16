// Load quotes from localStorage or start with default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "Inspiration" },
  { text: "Life is what happens when you’re busy making other plans.", author: "John Lennon", category: "Life" },
  { text: "Do not pray for an easy life, pray for the strength to endure a difficult one.", author: "Bruce Lee", category: "Motivation" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display quotes dynamically
function displayQuotes(filteredQuotes = quotes) {
  const container = document.getElementById("quotesList");
  container.innerHTML = "";
  filteredQuotes.forEach((q, index) => {
    const div = document.createElement("div");
    div.innerHTML = `<p>"${q.text}" - ${q.author} [${q.category}]</p>`;
    container.appendChild(div);
  });
}

// Populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedFilter;
  filterQuotes();
}

// Filter quotes by selected category
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

// Add new quote
function addQuote() {
  const text = document.getElementById("quoteInput").value.trim();
  const author = document.getElementById("authorInput").value.trim();
  const category = document.getElementById("categoryInput").value.trim();

  if (text && author && category) {
    quotes.push({ text, author, category });
    saveQuotes();
    populateCategories(); // refresh categories with new one
    filterQuotes();
    
    document.getElementById("quoteInput").value = "";
    document.getElementById("authorInput").value = "";
    document.getElementById("categoryInput").value = "";
  } else {
    alert("Please fill in all fields.");
  }
}

// Initialize app
window.onload = function () {
  populateCategories();
};
