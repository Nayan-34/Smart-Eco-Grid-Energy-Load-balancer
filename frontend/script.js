// Smart Eco-Grid Management System
// Frontend prototype using simulated data.

// ------ Initial Data -----

const initialLoads = [
    { name: "Hospital", power: 800, priority: 3 },
    { name: "College", power: 600, priority: 2 },
    { name: "Street Lights", power: 300, priority: 1 },
    { name: "Shopping Complex", power: 500, priority: 1 }
];

const initialTeams = [
    { name: "Team A", available: true },
    { name: "Team B", available: true },
    { name: "Team C", available: false }
];

let loads = initialLoads.map(function (load) {
    return { ...load, supplied: 0, status: "Active" };
});

let teams = initialTeams.map(function (team) {
    return { ...team };
});

let solar = 1000;
let hydro = 800;
let wind = 700;

let generation = solar + hydro + wind;
let demand = 0;

let simulationTimer = null;
let simulationRunning = false;

// -------------------- Helper Functions --------------------

function getElement(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }
}

function getTotalDemand() {
    return loads.reduce(function (total, load) {
        return total + load.power;
    }, 0);
}

function getTotalSupplied() {
    return loads.reduce(function (total, load) {
        return total + load.supplied;
    }, 0);
}

function getPriorityName(priority) {
    if (priority === 3) return "3 - Critical";
    if (priority === 2) return "2 - Important";
    return "1 - Normal";
}

function getPriorityClass(priority) {
    if (priority === 3) return "priority-critical";
    if (priority === 2) return "priority-important";
    return "priority-normal";
}

function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

function updateLastUpdated() {
    setText("lastUpdated", "Last updated: " + getCurrentTime());
}
