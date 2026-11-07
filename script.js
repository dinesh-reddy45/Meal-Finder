
const API = "https://www.themealdb.com/api/json/v1/1/";
let allCategories = [];

const categoriesGrid = document.getElementById("categoriesGrid");
const menuList = document.getElementById("menuList");
const sideMenu = document.getElementById("sideMenu");
const searchInput = document.getElementById("searchInput");

const breadcrumb = document.getElementById("breadcrumb");
const breadcrumbName = document.getElementById("breadcrumbName");

const detailSection = document.getElementById("detailSection");
const detailCard = document.getElementById("detailCard");

const categoryInfo = document.getElementById("categoryInfo");
const categoryInfoTitle = document.getElementById("categoryInfoTitle");
const categoryInfoText = document.getElementById("categoryInfoText");

const mealsSection = document.getElementById("mealsSection");
const mealsGrid = document.getElementById("mealsGrid");



async function getCategories() {
  try {
    const response = await fetch(API + "categories.php");
    const data = await response.json();

    allCategories = data.categories;   // save for later
    showCategories();
    showMenuItems();
  } catch (error) {
    categoriesGrid.innerHTML = "<p class='message'>Could not load categories. Check your internet.</p>";
  }
}

// category cards on the page
function showCategories() {
  let html = "";

  for (let i = 0; i < allCategories.length; i++) {
    const cat = allCategories[i];

    html += `
      <div class="category-card" onclick="getMealsByCategory('${cat.strCategory}')">
        <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}">
        <span class="badge">${cat.strCategory}</span>
      </div>
    `;
  }

  categoriesGrid.innerHTML = html;
}

// Show the category names inside the side menu
function showMenuItems() {
  let html = "";

  for (let i = 0; i < allCategories.length; i++) {
    const name = allCategories[i].strCategory;
    html += `<li onclick="getMealsByCategory('${name}'); closeMenu();">${name}</li>`;
  }

  menuList.innerHTML = html;
}

async function getMealsByCategory(categoryName) {
  hideEverything();

  // find this category in our saved list to get its description
  let description = "";
  for (let i = 0; i < allCategories.length; i++) {
    if (allCategories[i].strCategory === categoryName) {
      description = allCategories[i].strCategoryDescription;
    }
  }

  // fill and show the description box
  categoryInfoTitle.textContent = categoryName;
  categoryInfoText.textContent = description;
  categoryInfo.classList.remove("hidden");

  mealsSection.style.background = "#f5f5f5";
  mealsSection.classList.remove("hidden");
  mealsGrid.innerHTML = "<p class='message'>Loading meals...</p>";
  window.scrollTo(0, 0);

  try {
    const response = await fetch(API + "filter.php?c=" + categoryName);
    const data = await response.json();
    showMeals(data.meals, "category");
  } catch (error) {
    mealsGrid.innerHTML = "<p class='message'>Could not load meals.</p>";
  }
}

async function searchMeals() {
  const foodName = searchInput.value.trim();

  // do nothing if the box is empty
  if (foodName === "") {
    return;
  }

  hideEverything();

  mealsSection.style.background = "white";
  mealsSection.classList.remove("hidden");
  mealsGrid.innerHTML = "<p class='message'>Searching...</p>";
  window.scrollTo(0, 0);

  try {
    const response = await fetch(API + "search.php?s=" + foodName);
    const data = await response.json();
    showMeals(data.meals, "search");
  } catch (error) {
    mealsGrid.innerHTML = "<p class='message'>Something went wrong. Try again.</p>";
  }
}

// Pressing Enter in the search box also searches
searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchMeals();
  }
});

function showMeals(meals, type) {
  // the API gives null when nothing is found
  if (meals === null) {
    mealsGrid.innerHTML = "<p class='message'>No meals found. Try another name.</p>";
    return;
  }

  let html = "";

  for (let i = 0; i < meals.length; i++) {
    const meal = meals[i];

    if (type === "search") {
      html += `
        <div class="meal-card" onclick="getMealDetails('${meal.idMeal}')">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <span class="meal-tag">${meal.strCategory}</span>
          <div class="meal-info">
            <span class="meal-area">${meal.strArea}</span>
            <div class="meal-name">${meal.strMeal}</div>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="meal-card" onclick="getMealDetails('${meal.idMeal}')">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <div class="meal-info">
            <div class="meal-name">${meal.strMeal}</div>
          </div>
        </div>
      `;
    }
  }

  mealsGrid.innerHTML = html;
}

async function getMealDetails(id) {
  hideEverything();

  detailSection.classList.remove("hidden");
  breadcrumb.classList.remove("hidden");
  detailCard.innerHTML = "<p class='message'>Loading...</p>";
  window.scrollTo(0, 0);

  try {
    const response = await fetch(API + "lookup.php?i=" + id);
    const data = await response.json();
    const meal = data.meals[0];     // lookup gives a list with 1 meal

    showMealDetails(meal);
  } catch (error) {
    detailCard.innerHTML = "<p class='message'>Could not load this meal.</p>";
  }
}

function showMealDetails(meal) {
  breadcrumbName.textContent = meal.strMeal;

  let ingredientsHtml = "";
  let measuresHtml = "";
  let count = 0;

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal["strIngredient" + i];
    const measure = meal["strMeasure" + i];

    // empty ingredient = no more ingredients
    if (ingredient && ingredient.trim() !== "") {
      count++;
      ingredientsHtml += `<li><span class="number">${count}</span>${ingredient}</li>`;
      measuresHtml += `
        <li>
          <svg width="14" height="14" viewBox="0 0 24 24"><path d="M4 20L14 10" stroke="#e2611f" stroke-width="3.5" stroke-linecap="round"/><circle cx="17" cy="7" r="5" fill="#e2611f"/></svg>
          ${measure}
        </li>`;
    }
  }

  const steps = meal.strInstructions.split("\n");
  let stepsHtml = "";

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i].trim();
    if (step !== "") {
      stepsHtml += `<li><span class="check">&#10003;</span><span>${step}</span></li>`;
    }
  }

  let tagsHtml = "";
  if (meal.strTags) {
    const tags = meal.strTags.split(",");
    for (let i = 0; i < tags.length; i++) {
      tagsHtml += `<span class="tag">${tags[i]}</span>`;
    }
  }

  let sourceHtml = "";
  if (meal.strSource) {
    sourceHtml = `<a href="${meal.strSource}" target="_blank">${meal.strSource}</a>`;
  }

  // ---- put everything on the page ----
  detailCard.innerHTML = `
    <div class="detail-top">
      <div class="detail-left">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      </div>

      <div class="detail-right">
        <h3>${meal.strMeal}</h3>
        <div class="detail-line"><b>CATEGORY:</b> ${meal.strCategory}</div>
        <div class="detail-line"><b>Source:</b> ${sourceHtml}</div>
        <div class="detail-line"><b>Tags:</b> ${tagsHtml}</div>

        <div class="ingredients-box">
          <h4>Ingredients</h4>
          <ul class="ingredients-list">${ingredientsHtml}</ul>
        </div>
      </div>
    </div>

    <h4 class="sub-title">Measure:</h4>
    <ul class="measure-box">${measuresHtml}</ul>

    <h4 class="sub-title">Instructions:</h4>
    <ul class="steps">${stepsHtml}</ul>
  `;
}

// hide all the changing sections
function hideEverything() {
  breadcrumb.classList.add("hidden");
  detailSection.classList.add("hidden");
  categoryInfo.classList.add("hidden");
  mealsSection.classList.add("hidden");
}

// logo / home icon
function goHome() {
  hideEverything();
  searchInput.value = "";
  window.scrollTo(0, 0);
}

function openMenu() {
  sideMenu.classList.add("open");
}

function closeMenu() {
  sideMenu.classList.remove("open");
}
getCategories();
