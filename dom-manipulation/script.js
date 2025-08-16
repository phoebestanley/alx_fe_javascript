// Initial quotes array
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Motivation" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", category: "Life" },
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");

// ✅ Populate categories dynamically
function populateCategories() {
  categorySelect.innerHTML = "";
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// ✅ Show random quote
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
}

// ✅ Add new quote dynamically
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both a quote and a category!");
    return;
  }

  // Push into array
  quotes.push({ text: newQuoteText, category: newQuoteCategory });

  // Refresh categories
  populateCategories();

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// ✅ Event listener for showing quotes
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize categories on page load
populateCategories();
