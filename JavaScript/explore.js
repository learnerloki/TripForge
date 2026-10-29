const destinations = [
  {
    name: "Srinagar",
    state: "Jammu and Kashmir",
    experiences: [
      "Nature",
      "Relaxation & Wellness",
      "Photography",
      "Hidden Gems",
      "Family Activities",
      "Food & Local Life",
      "Adventure",
    ],
  },
  {
    name: "Jaipur",
    state: "Rajasthan",
    experiences: [
      "Culture & Heritage",
      "History",
      "Food & Local Life",
      "Shopping",
      "Photography",
      "Family Activities",
      "Hidden Gems",
    ],
  },
  {
    name: "Varanasi",
    state: "Uttar Pradesh",
    experiences: [
      "Spiritual",
      "Culture & Heritage",
      "History",
      "Food & Local Life",
      "Photography",
      "Shopping",
    ],
  },
  {
    name: "Shillong",
    state: "Meghalaya",
    experiences: [
      "Nature",
      "Adventure",
      "Photography",
      "Hidden Gems",
      "Food & Local Life",
      "Family Activities",
    ],
  },
  {
    name: "Gangtok",
    state: "Sikkim",
    experiences: [
      "Nature",
      "Adventure",
      "Photography",
      "Shopping",
      "Food & Local Life",
      "Hidden Gems",
      "Family Activities",
    ],
  },
  {
    name: "Darjeeling",
    state: "West Bengal",
    experiences: [
      "Nature",
      "Photography",
      "Adventure",
      "Food & Local Life",
      "Shopping",
      "Family Activities",
      "Hidden Gems",
    ],
  },
  {
    name: "Kaziranga",
    state: "Assam",
    experiences: [
      "Wildlife",
      "Nature",
      "Adventure",
      "Photography",
      "Family Activities",
    ],
  },
  {
    name: "Puri",
    state: "Odisha",
    experiences: [
      "Beaches",
      "Spiritual",
      "Culture & Heritage",
      "History",
      "Food & Local Life",
      "Photography",
      "Family Activities",
    ],
  },
  {
    name: "Hyderabad",
    state: "Telangana",
    experiences: [
      "Culture & Heritage",
      "History",
      "Food & Local Life",
      "Shopping",
      "Nightlife",
      "Photography",
      "Spiritual",
      "Family Activities",
    ],
  },
  {
    name: "Tirupati",
    state: "Andhra Pradesh",
    experiences: [
      "Spiritual",
      "Culture & Heritage",
      "Nature",
      "History",
      "Food & Local Life",
      "Family Activities",
      "Photography",
    ],
  },
  {
    name: "Mysuru",
    state: "Karnataka",
    experiences: [
      "Culture & Heritage",
      "History",
      "Nature",
      "Photography",
      "Shopping",
      "Food & Local Life",
      "Family Activities",
    ],
  },
  {
    name: "Kochi",
    state: "Kerala",
    experiences: [
      "Beaches",
      "Culture & Heritage",
      "History",
      "Food & Local Life",
      "Photography",
      "Shopping",
      "Hidden Gems",
      "Nightlife",
    ],
  },
  {
    name: "Goa",
    state: "Goa",
    experiences: [
      "Beaches",
      "Water Sports",
      "Nightlife",
      "Relaxation & Wellness",
      "Food & Local Life",
      "Adventure",
      "Photography",
      "Shopping",
      "Hidden Gems",
    ],
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    experiences: [
      "Nightlife",
      "Food & Local Life",
      "Shopping",
      "Culture & Heritage",
      "History",
      "Photography",
      "Beaches",
      "Family Activities",
    ],
  },
  {
    name: "Khajuraho",
    state: "Madhya Pradesh",
    experiences: [
      "Culture & Heritage",
      "History",
      "Photography",
      "Spiritual",
      "Nature",
      "Hidden Gems",
      "Family Activities",
    ],
  },
];

// =========================================
// 1. DOM ELEMENTS
// =========================================

// grabgin refs... hope these IDs don't change later lol
const toggleButton = document.querySelector("#toggle-filters");
const additionalFilters = document.querySelector("#additional-filters");

const destinationForm = document.querySelector("#destination-search");
const destinationInput = document.querySelector("#destination-input");

const resultsDescription = document.querySelector("#results-description");
const placesGrid = document.querySelector("#places-grid");
const noResults = document.querySelector("#no-results");

const selectedFilterSummary = document.querySelector(
  "#selected-filter-summary",
);

const resultsSort = document.querySelector("#results-sort");

const selectedPlacesCount = document.querySelector("#selected-places-count");

const selectedPlacesList = document.querySelector("#selected-places-list");

const createTripButton = document.querySelector("#create-trip-button");
const tripSelectionMessage = document.querySelector("#trip-selection-message");

// TODO: check if this selector needs to be more specific later
const experienceCheckboxes = document.querySelectorAll(
  'input[name="experience"]',
);

// =========================================
// 2. APPLICATION STATE
// =========================================

let matchedDestination = null;
let selectedFilters = [];
let matchingExperiences = []; // maybe don't even need this globally? keeping it for now

const STORAGE_KEY = "tripforge-selected-places";

let selectedPlaces = loadSelectedPlaces();

// =========================================
// 3. FILTER VALUE MAPPING
// =========================================

// Checkbox values do not always match the
// experience names in the destination dataset.
// NOTE: remember to add more tags here if we expand the categories!!

const experienceLabels = {
  adventure: "Adventure",
  nature: "Nature",
  culture: "Culture & Heritage",
  relaxation: "Relaxation & Wellness",
  wildlife: "Wildlife",
  beaches: "Beaches",
  food: "Food & Local Life",
  history: "History",
  spiritual: "Spiritual",
  photography: "Photography",
  "water-sports": "Water Sports",
  nightlife: "Nightlife",
  "hidden-gems": "Hidden Gems",
  shopping: "Shopping",
  family: "Family Activities",
};

// =========================================
// 4. LOCAL STORAGE
// =========================================

function loadSelectedPlaces() {
  try {
    const savedPlaces = JSON.parse(localStorage.getItem(STORAGE_KEY));

    // just making sure it's actually an array lol
    return Array.isArray(savedPlaces) ? savedPlaces : [];
  } catch (error) {
    console.warn("Could not load saved trip selections.", error);
    return [];
  }
}

function saveSelectedPlaces() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPlaces));
  } catch (error) {
    console.warn("Could not save trip selections.", error);

    if (tripSelectionMessage) {
      tripSelectionMessage.textContent =
        "Your browser could not save these selections.";
    }
  }
}

// =========================================
// 5. SHOW / HIDE ADDITIONAL FILTERS
// =========================================

if (toggleButton && additionalFilters) {
  toggleButton.addEventListener("click", () => {
    const isExpanded = !additionalFilters.hidden;

    additionalFilters.hidden = isExpanded;

    toggleButton.textContent = isExpanded ? "More filters ↓" : "Less filters ↑";

    toggleButton.setAttribute("aria-expanded", String(!isExpanded));
  });
}

// =========================================
// 6. READ SELECTED FILTERS
// =========================================

function readSelectedFilters() {
  // mapping checkboxes to readable names
  selectedFilters = Array.from(experienceCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => {
      return experienceLabels[checkbox.value] || checkbox.value;
    });
}

// =========================================
// 7. SEARCH FOR A DESTINATION
// =========================================

if (destinationForm && destinationInput) {
  destinationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchTerm = destinationInput.value.trim().toLowerCase();

    matchedDestination = null;
    matchingExperiences = [];

    if (searchTerm === "") {
      resultsDescription.textContent =
        "Enter a destination to begin exploring.";

      renderExperiences();
      return;
    }

    // finding the destination - case insensitive match would be nice, but names are capitalized in array
    matchedDestination = destinations.find((destination) => {
      return destination.name.toLowerCase() === searchTerm;
    });

    if (!matchedDestination) {
      resultsDescription.textContent =
        "Destination not found. Try another destination.";

      renderExperiences();
      return;
    }

    resultsDescription.textContent =
      `Explore ${matchedDestination.name}, ` +
      `${matchedDestination.state} — select your interests.`;

    renderExperiences();
  });
}

// =========================================
// 8. FILTER CHECKBOX EVENTS
// =========================================

experienceCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    readSelectedFilters();
    renderExperiences();
  });
});

// =========================================
// 9. SORTING
// =========================================

if (resultsSort) {
  resultsSort.addEventListener("change", () => {
    renderExperiences();
  });
}

function sortExperiences(experiences) {
  const sorted = [...experiences];

  if (!resultsSort) {
    return sorted;
  }

  // quick sorting logic based on dropdown
  switch (resultsSort.value) {
    case "za":
    case "descending":
      return sorted.sort((a, b) => b.localeCompare(a));

    case "az":
    case "ascending":
      return sorted.sort((a, b) => a.localeCompare(b));

    default:
      return sorted;
  }
}

// =========================================
// 10. RENDER EXPERIENCE CARDS
// =========================================

function renderExperiences() {
  if (!placesGrid) return;

  // Clear cards from the previous search.
  placesGrid.replaceChildren();

  if (selectedFilterSummary) {
    selectedFilterSummary.textContent =
      selectedFilters.length > 0
        ? `${selectedFilters.length} interest${
            selectedFilters.length === 1 ? "" : "s"
          } selected`
        : "All experiences";
  }

  // Nothing is displayed before a valid search.
  if (!matchedDestination) {
    matchingExperiences = [];

    if (noResults) {
      noResults.hidden = true;
    }

    return;
  }

  // Filter the destination's experiences.
  matchingExperiences = matchedDestination.experiences.filter((experience) => {
    return (
      selectedFilters.length === 0 ||
      selectedFilters.some(
        (filter) => filter.toLowerCase() === experience.toLowerCase(),
      )
    );
  });

  matchingExperiences = sortExperiences(matchingExperiences);

  // Update the empty state.
  if (noResults) {
    noResults.hidden = matchingExperiences.length !== 0;
  }

  if (matchingExperiences.length === 0) {
    if (noResults) {
      noResults.textContent =
        "No experiences match your filters. Try changing your interests.";
    }

    return;
  }

  // Build a card for every matching experience.
  const fragment = document.createDocumentFragment();

  matchingExperiences.forEach((experience) => {
    const card = document.createElement("article");
    card.classList.add("place-card");

    const heading = document.createElement("h3");
    heading.classList.add("place-card__title");
    heading.textContent = experience;

    const location = document.createElement("p");
    location.classList.add("place-card__location");
    location.textContent = `${matchedDestination.name}, ${matchedDestination.state}`;

    const description = document.createElement("p");
    description.classList.add("place-card__description");
    description.textContent =
      `Explore ${experience.toLowerCase()} experiences in ` +
      `${matchedDestination.name}.`;

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.classList.add("place-card__select");

    const placeKey = getPlaceKey(matchedDestination.name, experience);

    const isSelected = selectedPlaces.some((place) => place.key === placeKey);

    selectButton.textContent = isSelected ? "Added to trip ✓" : "Add to trip";

    selectButton.setAttribute("aria-pressed", String(isSelected));

    selectButton.addEventListener("click", () => {
      togglePlaceSelection(matchedDestination, experience);
    });

    card.append(heading, location, description, selectButton);

    fragment.appendChild(card);
  });

  placesGrid.appendChild(fragment);
}

// =========================================
// 11. UNIQUE PLACE KEY
// =========================================

function getPlaceKey(destinationName, experience) {
  return `${destinationName}::${experience}`.toLowerCase();
}

// =========================================
// 12. ADD / REMOVE PLACES FROM A TRIP
// =========================================

function togglePlaceSelection(destination, experience) {
  const key = getPlaceKey(destination.name, experience);

  const existingIndex = selectedPlaces.findIndex((place) => place.key === key);

  if (existingIndex !== -1) {
    selectedPlaces.splice(existingIndex, 1);

    if (tripSelectionMessage) {
      tripSelectionMessage.textContent = `${experience} removed from your trip selections.`;
    }
  } else {
    selectedPlaces.push({
      key,
      destination: destination.name,
      state: destination.state,
      experience,
    });

    if (tripSelectionMessage) {
      tripSelectionMessage.textContent = `${experience} added to your trip selections.`;
    }
  }

  saveSelectedPlaces();
  renderSelectedPlaces();
  renderExperiences();
}

// =========================================
// 13. RENDER SELECTED PLACES
// =========================================

function renderSelectedPlaces() {
  if (selectedPlacesCount) {
    selectedPlacesCount.textContent = String(selectedPlaces.length);
  }

  if (selectedPlacesList) {
    selectedPlacesList.replaceChildren();

    if (selectedPlaces.length === 0) {
      const emptyMessage = document.createElement("p");

      emptyMessage.textContent = "Your selected places will appear here.";

      selectedPlacesList.appendChild(emptyMessage);
    } else {
      selectedPlaces.forEach((place) => {
        const item = document.createElement("div");
        item.classList.add("selected-place");

        const details = document.createElement("div");

        const name = document.createElement("p");
        name.classList.add("selected-place__name");
        name.textContent = place.destination;

        const category = document.createElement("p");
        category.classList.add("selected-place__category");
        category.textContent = `${place.experience} · ${place.state}`;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.classList.add("selected-place__remove");
        removeButton.textContent = "Remove";
        removeButton.setAttribute(
          "aria-label",
          `Remove ${place.experience} in ${place.destination}`,
        );

        removeButton.addEventListener("click", () => {
          // filtering out the item
          selectedPlaces = selectedPlaces.filter(
            (selectedPlace) => selectedPlace.key !== place.key,
          );

          saveSelectedPlaces();
          renderSelectedPlaces();
          renderExperiences();
        });

        details.append(name, category);
        item.append(details, removeButton);
        selectedPlacesList.appendChild(item);
      });
    }
  }

  if (createTripButton) {
    createTripButton.disabled = selectedPlaces.length === 0;
  }
}

// =========================================
// 14. CREATE TRIP ACTION
// =========================================

if (createTripButton) {
  createTripButton.addEventListener("click", () => {
    if (selectedPlaces.length === 0) {
      if (tripSelectionMessage) {
        tripSelectionMessage.textContent =
          "Select at least one experience before creating a trip.";
      }

      return;
    }

    // Save selections for another page to access.
    saveSelectedPlaces();

    // Connect this to your actual trip-creation page
    // when that page is ready.
    window.location.href = "new-trips.html";
  });
}

// =========================================
// 15. INITIAL PAGE STATE
// =========================================

// Let's get things rolling on page load
readSelectedFilters();
renderSelectedPlaces();
renderExperiences();
