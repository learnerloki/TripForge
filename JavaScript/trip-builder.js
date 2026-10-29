/* ========================================
   TRIPFORGE — TRIP BUILDER JS
   Section A: Trip Header
   ======================================== */

const STORAGE_KEY_SELECTED = "tripforge-selected-places";

const headerDestination = document.getElementById("header-destination");
const headerExperiences = document.getElementById("header-experiences");
const btnEditDestination = document.getElementById("btn-edit-destination");

function loadSelectedPlaces() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_SELECTED));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.warn("Could not load selected places.", error);
    return [];
  }
}

function initSectionA() {
  const places = loadSelectedPlaces();

  if (places.length === 0) {
    headerDestination.textContent = "No destination selected";
    headerExperiences.textContent = "Head to Explore to pick places first.";
    btnEditDestination.textContent = "Go to Explore";
    btnEditDestination.addEventListener("click", () => {
      window.location.href = "explore.html";
    });
    return;
  }

  // Use the first selected place as the primary destination
  const destination = places[0].destination;
  const state = places[0].state;

  // Collect unique experiences across all selected places
  const experiences = [...new Set(places.map((place) => place.experience))];

  headerDestination.textContent = `${destination}, ${state}`;
  headerExperiences.textContent = experiences.join(" · ");

  btnEditDestination.addEventListener("click", () => {
    // Placeholder for future destination picker modal
    alert("Destination picker coming soon.");
  });
}

// ========================================
// Section B: Dates & Duration
// ========================================

const inputStartDate = document.getElementById("input-start-date");
const inputEndDate = document.getElementById("input-end-date");
const valueTotalDays = document.getElementById("value-total-days");
const errorDates = document.getElementById("error-dates");

let tripDates = {
  start: null,
  end: null,
  totalDays: 0,
};

function computeTotalDays(start, end) {
  if (!start || !end) return 0;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return Math.max(0, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
}

function updateDates() {
  const start = inputStartDate.value;
  const end = inputEndDate.value;

  tripDates.start = start;
  tripDates.end = end;
  tripDates.totalDays = computeTotalDays(start, end);

  valueTotalDays.textContent = tripDates.totalDays;

  if (start && end && end < start) {
    errorDates.hidden = false;
  } else {
    errorDates.hidden = true;
  }
}

// ========================================
// Section C: Travel Party
// ========================================

let tripMembers = {
  adults: 1,
  children: 0,
};

// ---- Adults ----
const adultsMinus = document.getElementById("btn-adults-minus");
const adultsPlus = document.getElementById("btn-adults-plus");
const adultsInput = document.getElementById("input-adults");

// ---- Children ----
const childrenMinus = document.getElementById("btn-children-minus");
const childrenPlus = document.getElementById("btn-children-plus");
const childrenInput = document.getElementById("input-children");

// ========================================
// Section D: Budget & Stay Preference
// ========================================

let tripBudget = {
  total: 0,
  perDay: 0,
  stayPreference: "Budget",
};

const budgetInput = document.getElementById("input-budget-total");
const budgetPerDay = document.getElementById("readout-budget-per-day");
const stayRadios = document.querySelectorAll('input[name="stayPreference"]');

budgetInput.addEventListener("input", function () {
  tripBudget.total = parseInt(budgetInput.value, 10) || 0;

  if (tripDates.totalDays > 0) {
    tripBudget.perDay = tripBudget.total / tripDates.totalDays;
  } else {
    tripBudget.perDay = 0;
  }

  budgetPerDay.innerHTML =
    "Per day: ₹<span>" + tripBudget.perDay.toFixed(0) + "</span>";
  console.log("Budget total:", tripBudget.total, "Per day:", tripBudget.perDay);
  saveTripState();
});

stayRadios.forEach(function (radio) {
  radio.addEventListener("change", function () {
    tripBudget.stayPreference = radio.value;
    console.log("Stay preference:", tripBudget.stayPreference);
    saveTripState();
  });
});

// ========================================
// Section E: Nearby Hotels
// ========================================

let tripHotel = {
  selectedId: null,
  hotel: null,
};

const hotels = [
  {
    id: "hotel-1",
    name: "The Lakeview Resort",
    tier: "Luxury",
    rating: 4.8,
    distance: "0.2 km",
    price: 3099,
    amenities: ["Pool", "Spa", "Wi-Fi", "Breakfast"],
  },
  {
    id: "hotel-2",
    name: "Hillside Guesthouse",
    tier: "Mid-range",
    rating: 4.2,
    distance: "0.5 km",
    price: 1099,
    amenities: ["Wi-Fi", "Parking", "Laundry"],
  },
  {
    id: "hotel-3",
    name: "Backpackers Hostel",
    tier: "Budget",
    rating: 3.9,
    distance: "0.8 km",
    price: 499,
    amenities: ["Wi-Fi", "Shared Kitchen"],
  },
];

const gridHotels = document.getElementById("grid-hotels");
const errorHotel = document.getElementById("error-hotel");

function renderHotels() {
  gridHotels.innerHTML = "";

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i];
    const card = document.createElement("article");
    card.className = "hotel-card";
    card.setAttribute("data-hotel-id", hotel.id);

    if (tripHotel.selectedId === hotel.id) {
      card.classList.add("selected");
    }

    let amenitiesHtml = "";
    for (let a = 0; a < hotel.amenities.length; a++) {
      amenitiesHtml =
        amenitiesHtml +
        '<li class="hotel-card-amenity">' +
        hotel.amenities[a] +
        "</li>";
    }

    card.innerHTML =
      '<span class="hotel-card-badge">' +
      hotel.tier +
      "</span>" +
      '<h3 class="hotel-card-name">' +
      hotel.name +
      "</h3>" +
      '<div class="hotel-card-meta">' +
      "<span>★ " +
      hotel.rating +
      "</span>" +
      "<span>· " +
      hotel.distance +
      " from center</span>" +
      "</div>" +
      '<p class="hotel-card-price">₹' +
      hotel.price +
      " / night</p>" +
      '<ul class="hotel-card-amenities">' +
      amenitiesHtml +
      "</ul>" +
      '<button type="button" class="hotel-card-select">Select stay</button>';

    gridHotels.appendChild(card);
  }

  // Attach select button listeners
  const cards = gridHotels.querySelectorAll(".hotel-card");
  for (let c = 0; c < cards.length; c++) {
    cards[c]
      .querySelector(".hotel-card-select")
      .addEventListener("click", function () {
        const card = this.closest(".hotel-card");
        const id = card.getAttribute("data-hotel-id");

        // Find the hotel object
        let selectedHotel = null;
        for (let h = 0; h < hotels.length; h++) {
          if (hotels[h].id === id) {
            selectedHotel = hotels[h];
            break;
          }
        }

        tripHotel.selectedId = id;
        tripHotel.hotel = selectedHotel;

        // Update UI selection
        for (let k = 0; k < cards.length; k++) {
          if (cards[k] === card) {
            cards[k].classList.add("selected");
          } else {
            cards[k].classList.remove("selected");
          }
        }

        console.log("Hotel selected:", hotel.name);
        saveTripState();
      });
  }
}

// ========================================
// Save & Load (localStorage)
// ========================================

const STORAGE_KEY_TRIP = "tripforge-trip-draft";

function saveTripState() {
  const draft = {
    dates: tripDates,
    members: tripMembers,
    budget: tripBudget,
    hotel: tripHotel,
    activities: tripActivities,
  };
  localStorage.setItem(STORAGE_KEY_TRIP, JSON.stringify(draft));
}

function loadTripState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TRIP);
    if (!saved) return;

    const draft = JSON.parse(saved);

    // Restore dates
    if (draft.dates) {
      tripDates = draft.dates;
      if (draft.dates.start) inputStartDate.value = draft.dates.start;
      if (draft.dates.end) inputEndDate.value = draft.dates.end;
      if (draft.dates.totalDays)
        valueTotalDays.textContent = draft.dates.totalDays;
    }

    // Restore members
    if (draft.members) {
      tripMembers = draft.members;
      if (adultsInput) adultsInput.value = tripMembers.adults;
      if (childrenInput) childrenInput.value = tripMembers.children;
    }

    // Restore budget
    if (draft.budget) {
      tripBudget = draft.budget;
      if (budgetInput) budgetInput.value = tripBudget.total;
      if (budgetPerDay) {
        budgetPerDay.innerHTML =
          "Per day: ₹<span>" + tripBudget.perDay.toFixed(0) + "</span>";
      }

      // Restore stay preference radio
      if (tripBudget.stayPreference) {
        for (let i = 0; i < stayRadios.length; i++) {
          if (stayRadios[i].value === tripBudget.stayPreference) {
            stayRadios[i].checked = true;
          }
        }
      }
    }

    // Restore hotel selection
    if (draft.hotel) {
      tripHotel = draft.hotel;
    }

    // Restore activities
    if (draft.activities) {
      tripActivities = draft.activities;
      if (inputActivitiesPerDay) {
        inputActivitiesPerDay.value = tripActivities.perDay;
      }
      updateActivitiesReadout();
    }

    // Re-render hotels and itinerary with saved selection
    renderHotels();
    renderItinerary();

    console.log("TripForge: Draft loaded from localStorage");
  } catch (error) {
    console.warn("Could not load trip draft.", error);
  }
}

// Add save to existing listeners (Section B dates)
inputStartDate.addEventListener("input", function () {
  updateDates();
  saveTripState();
  renderItinerary();
});

inputEndDate.addEventListener("input", function () {
  updateDates();
  saveTripState();
  renderItinerary();
});

// Add save to existing listeners (Section C members)
adultsPlus.addEventListener("click", function () {
  tripMembers.adults = tripMembers.adults + 1;
  adultsInput.value = tripMembers.adults;
  console.log("Adults:", tripMembers.adults);
  saveTripState();
});

adultsMinus.addEventListener("click", function () {
  if (tripMembers.adults > 1) {
    tripMembers.adults = tripMembers.adults - 1;
    adultsInput.value = tripMembers.adults;
    console.log("Adults:", tripMembers.adults);
    saveTripState();
  }
});

childrenPlus.addEventListener("click", function () {
  tripMembers.children = tripMembers.children + 1;
  childrenInput.value = tripMembers.children;
  console.log("Children:", tripMembers.children);
  saveTripState();
});

childrenMinus.addEventListener("click", function () {
  if (tripMembers.children > 0) {
    tripMembers.children = tripMembers.children - 1;
    childrenInput.value = tripMembers.children;
    console.log("Children:", tripMembers.children);
    saveTripState();
  }
});

// ========================================
// Section F: Daily Activities
// ========================================

let tripActivities = {
  perDay: 3,
  assignments: {}, // key: "dayIndex-slotIndex", value: experience name
};

const btnActivitiesMinus = document.getElementById("btn-activities-minus");
const btnActivitiesPlus = document.getElementById("btn-activities-plus");
const inputActivitiesPerDay = document.getElementById(
  "input-activities-per-day",
);
const readoutTotalSlots = document.getElementById("readout-total-slots");
const gridItinerary = document.getElementById("grid-itinerary");
const errorActivities = document.getElementById("error-activities");

// Get unique experiences from selected places
function getAvailableExperiences() {
  const places = loadSelectedPlaces();
  const experiences = [];
  for (let i = 0; i < places.length; i++) {
    const exp = places[i].experience;
    let found = false;
    for (let e = 0; e < experiences.length; e++) {
      if (experiences[e] === exp) {
        found = true;
        break;
      }
    }
    if (!found) {
      experiences.push(exp);
    }
  }
  return experiences;
}

function computeTotalSlots() {
  return tripDates.totalDays * tripActivities.perDay;
}

function updateActivitiesReadout() {
  const total = computeTotalSlots();
  readoutTotalSlots.textContent = "Total activity slots: " + total;
  saveTripState();
}

function renderItinerary() {
  gridItinerary.innerHTML = "";

  const experiences = getAvailableExperiences();

  for (let d = 0; d < tripDates.totalDays; d++) {
    const dayBlock = document.createElement("div");
    dayBlock.className = "itinerary-day";

    // Get date string for this day
    let dayDate = "";
    if (tripDates.start && tripDates.end) {
      const startMs = new Date(tripDates.start).getTime();
      const dayMs = startMs + d * 24 * 60 * 60 * 1000;
      const dayDateObj = new Date(dayMs);
      const options = { weekday: "short", month: "short", day: "numeric" };
      dayDate = dayDateObj.toLocaleDateString("en-IN", options);
    }

    const header = document.createElement("div");
    header.className = "itinerary-day-header";
    header.innerHTML =
      '<span class="itinerary-day-number">Day ' +
      (d + 1) +
      "</span>" +
      '<span class="itinerary-day-date">' +
      dayDate +
      "</span>";

    const slotsContainer = document.createElement("div");
    slotsContainer.className = "itinerary-slots";

    for (let s = 0; s < tripActivities.perDay; s++) {
      const slot = document.createElement("div");
      slot.className = "itinerary-slot";

      const slotKey = d + "-" + s;
      const savedValue = tripActivities.assignments[slotKey] || "";

      const label = document.createElement("div");
      label.className = "slot-label";
      const slotNames = ["Morning", "Afternoon", "Evening", "Night"];
      label.textContent = slotNames[s] || "Slot " + (s + 1);

      const select = document.createElement("select");
      select.className = "slot-select";

      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "Choose experience";
      select.appendChild(emptyOption);

      const freeOption = document.createElement("option");
      freeOption.value = "Free time";
      freeOption.textContent = "Free time";
      select.appendChild(freeOption);

      for (let e = 0; e < experiences.length; e++) {
        const opt = document.createElement("option");
        opt.value = experiences[e];
        opt.textContent = experiences[e];
        if (experiences[e] === savedValue) {
          opt.selected = true;
        }
        select.appendChild(opt);
      }

      select.value = savedValue;

      select.addEventListener("change", function () {
        tripActivities.assignments[slotKey] = select.value;
        saveTripState();
      });

      slot.appendChild(label);
      slot.appendChild(select);
      slotsContainer.appendChild(slot);
    }

    dayBlock.appendChild(header);
    dayBlock.appendChild(slotsContainer);
    gridItinerary.appendChild(dayBlock);
  }
}

// ---- Activities per day counter ----
btnActivitiesPlus.addEventListener("click", function () {
  if (tripActivities.perDay < 6) {
    tripActivities.perDay = tripActivities.perDay + 1;
    inputActivitiesPerDay.value = tripActivities.perDay;
    updateActivitiesReadout();
    renderItinerary();
  }
});

btnActivitiesMinus.addEventListener("click", function () {
  if (tripActivities.perDay > 1) {
    tripActivities.perDay = tripActivities.perDay - 1;
    inputActivitiesPerDay.value = tripActivities.perDay;
    updateActivitiesReadout();
    renderItinerary();
  }
});

inputActivitiesPerDay.addEventListener("input", function () {
  const val = parseInt(inputActivitiesPerDay.value, 10) || 4;
  if (val < 1) val = 1;
  if (val > 6) val = 6;
  tripActivities.perDay = val;
  inputActivitiesPerDay.value = tripActivities.perDay;
  updateActivitiesReadout();
  renderItinerary();
});

// ========================================
// Edit Trip Hydration (from My Trips)
// ========================================

const STORAGE_KEY_TRIPS = "tripforge-trips";
const editingTripId = sessionStorage.getItem("tripforge-editing-trip");
let isEditing = false;

function loadTripById(id) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TRIPS);
    if (!saved) return null;
    const trips = JSON.parse(saved);
    if (!Array.isArray(trips)) return null;
    for (let i = 0; i < trips.length; i++) {
      if (trips[i].id === id) {
        return trips[i];
      }
    }
  } catch (e) {
    console.warn("Could not load trip by id.", e);
  }
  return null;
}

function hydrateEditTrip(trip) {
  isEditing = true;

  // Dates
  if (trip.startDate) inputStartDate.value = trip.startDate;
  if (trip.endDate) inputEndDate.value = trip.endDate;
  tripDates.start = trip.startDate;
  tripDates.end = trip.endDate;
  tripDates.totalDays = trip.totalDays || 0;
  valueTotalDays.textContent = tripDates.totalDays;

  // Members
  if (trip.members) {
    tripMembers.adults = trip.members.adults || 1;
    tripMembers.children = trip.members.children || 0;
    adultsInput.value = tripMembers.adults;
    childrenInput.value = tripMembers.children;
  }

  // Budget
  if (trip.budget) {
    tripBudget.total = trip.budget.total || 0;
    tripBudget.perDay = trip.budget.perDay || 0;
    tripBudget.stayPreference = trip.budget.stayPreference || "Budget";
    budgetInput.value = tripBudget.total;
    budgetPerDay.innerHTML =
      "Per day: ₹<span>" + tripBudget.perDay.toFixed(0) + "</span>";

    // Stay preference radio
    for (let i = 0; i < stayRadios.length; i++) {
      stayRadios[i].checked = stayRadios[i].value === tripBudget.stayPreference;
    }
  }

  // Hotel
  if (trip.hotel) {
    tripHotel.selectedId = trip.hotel.id;
    tripHotel.hotel = trip.hotel;
  }

  // Activities
  if (trip.activities) {
    tripActivities.perDay = trip.activities.perDay || 3;
    tripActivities.assignments = trip.activities.assignments || {};
    inputActivitiesPerDay.value = tripActivities.perDay;
  }

  // Change save button text
  if (btnSaveTrip) {
    btnSaveTrip.textContent = "Update Trip →";
  }

  // Clear editing flag after hydrating
  sessionStorage.removeItem("tripforge-editing-trip");
}

// ========================================
// Section G: Trip Summary & Save
// ========================================

const summaryDestination = document.getElementById("summary-destination");
const summaryDates = document.getElementById("summary-dates");
const summaryMembers = document.getElementById("summary-members");
const summaryBudget = document.getElementById("summary-budget");
const summaryStay = document.getElementById("summary-stay");
const summaryActivities = document.getElementById("summary-activities");
const btnSaveTrip = document.getElementById("btn-save-trip");
const btnCancelTrip = document.getElementById("btn-cancel-trip");
const messageSave = document.getElementById("message-save");

function renderSummary() {
  // Destination
  const places = loadSelectedPlaces();
  if (places.length > 0) {
    summaryDestination.textContent =
      places[0].destination + ", " + places[0].state;
  } else {
    summaryDestination.textContent = "—";
  }

  // Dates
  if (tripDates.start && tripDates.end) {
    summaryDates.textContent =
      tripDates.start +
      " to " +
      tripDates.end +
      " (" +
      tripDates.totalDays +
      " days)";
  } else {
    summaryDates.textContent = "—";
  }

  // Members
  summaryMembers.textContent =
    tripMembers.adults + " Adults · " + tripMembers.children + " Children";

  // Budget
  if (tripBudget.total > 0) {
    summaryBudget.textContent =
      "₹" + tripBudget.total + " (₹" + tripBudget.perDay.toFixed(0) + " / day)";
  } else {
    summaryBudget.textContent = "—";
  }

  // Stay
  if (tripHotel.hotel) {
    summaryStay.textContent =
      tripHotel.hotel.name + " · " + tripHotel.hotel.tier;
  } else {
    summaryStay.textContent = "—";
  }

  // Activities
  summaryActivities.textContent = tripActivities.perDay + " per day";
}

function validateSave() {
  if (!tripDates.start || !tripDates.end) {
    return "Please select your travel dates.";
  }
  if (tripDates.totalDays === 0) {
    return "Please select valid dates.";
  }
  if (!tripHotel.selectedId) {
    return "Please select a hotel.";
  }
  if (tripActivities.perDay < 1) {
    return "Please set activities per day.";
  }
  return null;
}

function saveTrip() {
  console.log("TripBuilder: saveTrip called");
  console.log("TripBuilder: tripDates=", tripDates);
  console.log("TripBuilder: tripHotel.selectedId=", tripHotel.selectedId);
  console.log("TripBuilder: tripActivities.perDay=", tripActivities.perDay);

  const error = validateSave();
  console.log("TripBuilder: validateSave error=", error);
  if (error) {
    messageSave.textContent = error;
    messageSave.style.color = varError();
    messageSave.hidden = false;
    return;
  }

  const places = loadSelectedPlaces();
  const tripData = {
    destination: places.length > 0 ? places[0].destination : "",
    state: places.length > 0 ? places[0].state : "",
    startDate: tripDates.start,
    endDate: tripDates.end,
    totalDays: tripDates.totalDays,
    members: { adults: tripMembers.adults, children: tripMembers.children },
    budget: {
      total: tripBudget.total,
      perDay: tripBudget.perDay,
      stayPreference: tripBudget.stayPreference,
    },
    hotel: tripHotel.hotel,
    activities: {
      perDay: tripActivities.perDay,
      assignments: tripActivities.assignments,
    },
  };

  let allTrips = [];
  try {
    const saved = localStorage.getItem("tripforge-trips");
    if (saved) {
      allTrips = JSON.parse(saved);
      if (!Array.isArray(allTrips)) {
        allTrips = [];
      }
    }
  } catch (e) {
    allTrips = [];
  }

  if (isEditing && editingTripId) {
    // Update existing trip
    for (let i = 0; i < allTrips.length; i++) {
      if (allTrips[i].id === editingTripId) {
        allTrips[i] = {
          id: editingTripId,
          createdAt: allTrips[i].createdAt,
          ...tripData,
        };
        break;
      }
    }
    messageSave.textContent = "Trip updated successfully!";
  } else {
    // Create new trip
    const newTrip = {
      id: "trip-" + Date.now(),
      createdAt: new Date().toISOString(),
      ...tripData,
    };
    allTrips.push(newTrip);
    messageSave.textContent = "Trip saved successfully!";
  }

  try {
    localStorage.setItem("tripforge-trips", JSON.stringify(allTrips));
    console.log("TripBuilder: Saved", allTrips.length, "trips to localStorage");
    messageSave.style.color = varSuccess();
    messageSave.hidden = false;
    btnSaveTrip.disabled = true;

    setTimeout(function () {
      window.location.href = "dashboard.html";
    }, 1200);
  } catch (e) {
    messageSave.textContent = "Could not save trip. Please try again.";
    messageSave.style.color = varError();
    messageSave.hidden = false;
  }
}

function varError() {
  return "#b85c5c";
}

function varSuccess() {
  return "#6e9b72";
}

btnSaveTrip.addEventListener("click", function () {
  renderSummary();
  saveTrip();
});

btnCancelTrip.addEventListener("click", function () {
  if (confirm("Cancel and discard this trip?")) {
    localStorage.removeItem("tripforge-trip-draft");
    window.location.href = "index.html";
  }
});

// Re-render summary whenever anything changes
const origSave = saveTripState;
saveTripState = function () {
  origSave();
  renderSummary();
};

if (editingTripId) {
  const tripToEdit = loadTripById(editingTripId);
  if (tripToEdit) {
    hydrateEditTrip(tripToEdit);
  }
} else {
  loadTripState();
}

renderHotels();
renderItinerary();
renderSummary();
initSectionA();
initSectionB();
