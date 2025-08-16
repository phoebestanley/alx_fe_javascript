// script.js

// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It's not whether you get knocked down, it's whether you get up.", category: "Resilience" },
  { text: "Your time is limited, so don't waste it living someone else's life.", category: "Wisdom" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Create category dropdown dynamically
const categorySelect = document.createElement("select");
categorySelect.id = "categorySelect";
document.body.insertBefore(categorySelect, newQuoteBtn);

// Populate categories dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))]; // unique categories
  categorySelect.innerHTML = "";

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Show random quote from selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
}

// Add new quote dynamically
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both a quote and a category!");
    return;
  }

  // Prevent duplicate quote in the same category
  const exists = quotes.some(q => q.text === newQuoteText && q.category === newQuoteCategory);
  if (exists) {
    alert("This quote already exists in the selected category!");
    return;
  }

  // Add new quote object
  quotes.push({ text: newQuoteText, category: newQuoteCategory });

  // Refresh category dropdown
  populateCategories();

  // Auto-select the new category
  categorySelect.value = newQuoteCategory;

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Show the newly added quote immediately
  quoteDisplay.textContent = `"${newQuoteText}" — ${newQuoteCategory}`;
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize categories on page load
populateCategories();
categorySelect.value = quotes[0].category; // default select first category
showRandomQuote(); // show a random quote immediately
