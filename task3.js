// Elements
const plantContainer = document.getElementById("plantContainer");
const addPlantBtn = document.getElementById("addPlantBtn");
const plantFormContainer = document.getElementById("plantFormContainer");
const plantForm = document.getElementById("plantForm");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const filterSunlight = document.getElementById("filterSunlight");
const sortWatering = document.getElementById("sortWatering");

// Load plants from localStorage
let plants = JSON.parse(localStorage.getItem("plants")) || [];
let editIndex = null;
let timerIntervals = {}; // Store countdown intervals

// Format date (dd-mm-yyyy hh:mm AM/PM)
function formatDate(date) {
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Display plants
function displayPlants() {
    let filteredPlants = [...plants];

    // Filtering
    const sunlightFilter = filterSunlight ? filterSunlight.value : "All";
    if (sunlightFilter !== "All") {
        filteredPlants = filteredPlants.filter(p => p.sunlight === sunlightFilter);
    }

    // Sorting
    const sortOrder = sortWatering ? sortWatering.value : "None";
    if (sortOrder === "Asc") {
        filteredPlants.sort((a, b) => a.wateringFrequency - b.wateringFrequency);
    } else if (sortOrder === "Desc") {
        filteredPlants.sort((a, b) => b.wateringFrequency - a.wateringFrequency);
    }

    plantContainer.innerHTML = "";

    filteredPlants.forEach((plant, index) => {
        const card = document.createElement("div");
        card.className = "plant-card";
        card.id = `plant-card-${index}`;

        const plantImage = plant.image
            ? `<img src="${plant.image}" style="width:100%; border-radius:5px;">`
            : "";

        // Watering status container
        const wateringStatus = document.createElement("p");
        wateringStatus.id = `wateringStatus-${index}`;

        // Timer function
        function updateTimer() {
            if (!plant.lastWatered) {
                wateringStatus.innerHTML = `💧 Water every ${plant.wateringFrequency} days`;
                return;
            }

            const last = new Date(plant.lastWatered);
            const nextWater = new Date(last.getTime() + plant.wateringFrequency * 86400000);

            const now = new Date();
            const diff = nextWater - now;

            if (diff <= 0) {
                wateringStatus.innerHTML = `💧 <b>Needs Water!</b><br>Last watered: ${formatDate(last)}`;
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            wateringStatus.innerHTML =
                `🌱 Next water: <b>${formatDate(nextWater)}</b><br>` +
                `⏳ Time left: <b>${d}d ${h}h ${m}m ${s}s</b>`;
        }

        // Clear previous interval
        if (timerIntervals[index]) clearInterval(timerIntervals[index]);

        // Start real-time countdown
        timerIntervals[index] = setInterval(updateTimer, 1000);
        updateTimer();

        // Card HTML
        card.innerHTML = `
            ${plantImage}
            <h3>${plant.name}</h3>
            <p><strong>Species:</strong> ${plant.species}</p>
            <p><strong>Water every:</strong> ${plant.wateringFrequency} days</p>
            <p><strong>Sunlight:</strong> ${plant.sunlight}</p>
            <p>${plant.notes}</p>
        `;
        card.appendChild(wateringStatus);

        // Buttons
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => editPlant(index);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => deletePlant(index);

        const waterBtn = document.createElement("button");
        waterBtn.textContent = "Watered";
        waterBtn.onclick = () => markWatered(index);

        card.appendChild(editBtn);
        card.appendChild(deleteBtn);
        card.appendChild(waterBtn);

        plantContainer.appendChild(card);
    });
}

// Add/Edit Plant
plantForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const plantData = {
        name: document.getElementById("plantName").value,
        species: document.getElementById("plantSpecies").value,
        wateringFrequency: Number(document.getElementById("wateringFrequency").value),
        sunlight: document.getElementById("sunlight").value,
        notes: document.getElementById("notes").value,
        image: document.getElementById("plantImage") ? document.getElementById("plantImage").value : "",
        lastWatered: null
    };

    if (editIndex !== null) {
        plants[editIndex] = plantData;
        editIndex = null;
    } else {
        plants.push(plantData);
    }

    localStorage.setItem("plants", JSON.stringify(plants));
    plantForm.reset();
    plantFormContainer.classList.remove("active");
    displayPlants();
});

// Edit Plant
function editPlant(index) {
    editIndex = index;
    const plant = plants[index];
    document.getElementById("plantName").value = plant.name;
    document.getElementById("plantSpecies").value = plant.species;
    document.getElementById("wateringFrequency").value = plant.wateringFrequency;
    document.getElementById("sunlight").value = plant.sunlight;
    document.getElementById("notes").value = plant.notes;
    if (document.getElementById("plantImage")) {
        document.getElementById("plantImage").value = plant.image || "";
    }
    formTitle.textContent = "Edit Plant";
    plantFormContainer.classList.add("active");
}

// Delete Plant
function deletePlant(index) {
    if (confirm("Delete this plant?")) {
        plants.splice(index, 1);
        localStorage.setItem("plants", JSON.stringify(plants));
        displayPlants();
    }
}

// Mark as watered
function markWatered(index) {
    plants[index].lastWatered = new Date().toISOString();
    localStorage.setItem("plants", JSON.stringify(plants));
    alert(`💧 "${plants[index].name}" has been watered!`);
    displayPlants();
}

// Show modal
addPlantBtn.addEventListener("click", () => {
    editIndex = null;
    plantForm.reset();
    formTitle.textContent = "Add Plant";
    plantFormContainer.classList.add("active");
});

// Cancel modal
cancelBtn.addEventListener("click", () => {
    plantFormContainer.classList.remove("active");
});

// Outside click closes modal
plantFormContainer.addEventListener("click", (e) => {
    if (e.target === plantFormContainer) {
        plantFormContainer.classList.remove("active");
    }
});

// Filters
if (filterSunlight) filterSunlight.addEventListener("change", displayPlants);
if (sortWatering) sortWatering.addEventListener("change", displayPlants);

// Alerts
function checkWateringAlerts() {
    const now = new Date();
    plants.forEach(p => {
        if (p.lastWatered) {
            const last = new Date(p.lastWatered);
            const next = new Date(last.getTime() + p.wateringFrequency * 86400000);
            if (next <= now) alert(`💧 Water "${p.name}" now!`);
        }
    });
}

// Init
displayPlants();
checkWateringAlerts();
