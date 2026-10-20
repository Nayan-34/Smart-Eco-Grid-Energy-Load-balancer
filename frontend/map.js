"use strict";

//  Sample Grid Data 
// All values and map locations are simulated for this prototype.

const defaultValues = {
    solar: 1000,
    hydro: 800,
    wind: 700,
    hospital: 800,
    school: 300,
    college: 600,
    residential: 400,
    shopping: 500,
    available: 2500
};

const originalLoads = [
    { id: "hospital", name: "Hospital", icon: "🏥", priority: 1 },
    { id: "school", name: "School", icon: "🏫", priority: 1 },
    { id: "college", name: "College", icon: "🎓", priority: 2 },
    { id: "residential", name: "Residential Area", icon: "🏘️", priority: 3 },
    { id: "shopping", name: "Shopping Complex", icon: "🛒", priority: 3 }
];

const loadDefinitions = originalLoads.map(load => ({ ...load }));

const nodeLocations = {
    solar: [30.3500, 78.0000],
    hydro: [30.3700, 78.0950],
    wind: [30.3550, 78.0700],

    substationA: [30.3300, 78.0300],
    substationB: [30.3450, 78.0600],
    substationC: [30.3150, 78.0750],

    hospital: [30.3250, 78.0150],
    school: [30.3300, 78.0650],
    college: [30.3050, 78.0450],
    residential: [30.3000, 78.0850],
    shopping: [30.2850, 78.0550],

    depot: [30.3150, 78.0100]
};

const nodeNames = {
    solar: "Solar Farm",
    hydro: "Hydro Plant",
    wind: "Wind Farm",
    substationA: "Substation A",
    substationB: "Substation B",
    substationC: "Substation C",
    hospital: "Hospital",
    school: "School",
    college: "College",
    residential: "Residential Area",
    shopping: "Shopping Complex",
    depot: "Repair Depot"
};

const sourceInfo = {
    solar: { type: "Solar Generation", icon: "☀" },
    hydro: { type: "Hydro Generation", icon: "💧" },
    wind: { type: "Wind Generation", icon: "🌬" }
};

const substationNames = {
    substationA: "Substation A",
    substationB: "Substation B",
    substationC: "Substation C"
};

const state = {
    loads: [],
    customLoads: [],
    nextCustomId: 1,
    selectedNode: null,
    faults: new Set(),
    repairRoute: null,
    pathRoute: null,
    markers: {},
    lines: {}
};

// -------------------- Map Setup --------------------

const map = L.map("gridMap").setView([30.3250, 78.0500], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const sourceLayer = L.layerGroup().addTo(map);
const substationLayer = L.layerGroup().addTo(map);
const loadLayer = L.layerGroup().addTo(map);
const lineLayer = L.layerGroup().addTo(map);

// Keep the two route features separate.
const repairRouteLayer = L.layerGroup().addTo(map);
const pathRouteLayer = L.layerGroup().addTo(map);

//  Grid Connections 

const connections = [
    { id: "line-solar", from: "solar", to: "substationA", type: "source" },
    { id: "line-hydro", from: "hydro", to: "substationB", type: "source" },
    { id: "line-wind", from: "wind", to: "substationB", type: "source" },

    { id: "line-sub-a-b", from: "substationA", to: "substationB", type: "grid" },
    { id: "line-sub-b-c", from: "substationB", to: "substationC", type: "grid" },

    { id: "line-hospital", from: "substationA", to: "hospital", loadId: "hospital" },
    { id: "line-school", from: "substationB", to: "school", loadId: "school" },
    { id: "line-college", from: "substationA", to: "college", loadId: "college" },
    { id: "line-residential", from: "substationC", to: "residential", loadId: "residential" },
    { id: "line-shopping", from: "substationC", to: "shopping", loadId: "shopping" }
];

//  Helpers 

function getElement(id) {
    return document.getElementById(id);
}

function formatPower(value) {
    return `${Number(value).toLocaleString()} kW`;
}

function formatDistance(km) {
    return `${km.toFixed(2)} km`;
}

function getPriorityLabel(priority) {
    if (priority === 1) return "P1 - High";
    if (priority === 2) return "P2 - Medium";
    return "P3 - Low";
}

function setMessage(message, isError = false) {
    const element = getElement("simulationMessage");

    if (!element) return;

    element.textContent = message;
    element.classList.toggle("error", isError);
}

// Update the Start Point and End Point labels in the map panel.
function updateEnergyEndpoints(startId, endId) {
    const startElement = getElement("energyStartPoint");
    const endElement = getElement("energyEndPoint");

    if (startElement) {
        startElement.textContent = nodeNames[startId] || "Select a source";
    }

    if (endElement) {
        endElement.textContent = nodeNames[endId] || "Select a destination";
    }
}

function readNumber(id) {
    const input = getElement(id);

    if (!input) {
        throw new Error(`Missing input field: ${id}`);
    }

    const value = Number(input.value);

    if (
        input.value.trim() === "" ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 1000000
    ) {
        throw new Error(
            `${input.labels?.[0]?.textContent || id}: enter a value from 0 to 1,000,000.`
        );
    }

    return value;
}

function readInputs() {
    const generation = {
        solar: readNumber("solarInput"),
        hydro: readNumber("hydroInput"),
        wind: readNumber("windInput")
    };

    const requirements = {
        hospital: readNumber("hospitalInput"),
        school: readNumber("schoolInput"),
        college: readNumber("collegeInput"),
        residential: readNumber("residentialInput"),
        shopping: readNumber("shoppingInput")
    };

    state.customLoads.forEach(load => {
        requirements[load.id] = readNumber(`custom-demand-${load.id}`);
    });

    const available = readNumber("availablePower");

    const totalGeneration =
        generation.solar + generation.hydro + generation.wind;

    if (available > totalGeneration) {
        throw new Error("Available power cannot exceed total generation.");
    }

    return {
        generation,
        requirements,
        available,
        totalGeneration
    };
}
