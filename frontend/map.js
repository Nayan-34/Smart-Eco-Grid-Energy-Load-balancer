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
// -------------------- Priority-Based Allocation --------------------

function calculateAllocation(data) {
    let remainingPower = data.available;

    const sortedLoads = loadDefinitions
        .map((definition, index) => ({
            ...definition,
            required: data.requirements[definition.id],
            originalOrder: index
        }))
        .sort((a, b) =>
            a.priority - b.priority ||
            a.originalOrder - b.originalOrder
        );

    return sortedLoads.map(load => {
        const received = Math.min(load.required, remainingPower);
        remainingPower -= received;

        let status;

        if (load.required === 0 || received >= load.required) {
            status = "Active";
        } else if (received > 0) {
            status = "Limited";
        } else {
            status = "Off";
        }

        return {
            ...load,
            received,
            deficit: Math.max(0, load.required - received),
            status,
            percentage: load.required === 0
                ? 100
                : Math.round((received / load.required) * 100)
        };
    });
}

function getLineStatus(load) {
    if (state.faults.has(`line-${load.id}`)) {
        return "fault";
    }

    if (load.received < load.required) {
        return "limited";
    }

    return "normal";
}

// -------------------- Distance Helpers --------------------

// Haversine distance between two simulated map coordinates.
function distanceBetween(a, b) {
    const earthRadiusKm = 6371;
    const toRadians = degrees => degrees * Math.PI / 180;

    const lat1 = toRadians(a[0]);
    const lat2 = toRadians(b[0]);
    const deltaLat = toRadians(b[0] - a[0]);
    const deltaLng = toRadians(b[1] - a[1]);

    const value =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLng / 2) ** 2;

    return earthRadiusKm * 2 *
        Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function connectionDistance(connection) {
    return distanceBetween(
        nodeLocations[connection.from],
        nodeLocations[connection.to]
    );
}

// -------------------- Marker Creation --------------------

function createMarkerIcon(symbol, type, status = "") {
    return L.divIcon({
        className: "",
        html: `<div class="grid-marker ${type} ${status}">${symbol}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
    });
}

function addLocationMarker(id, name, coords, symbol, type, layer) {
    const marker = L.marker(coords, {
        icon: createMarkerIcon(symbol, type)
    }).addTo(layer);

    marker.bindTooltip(name, {
        direction: "top",
        className: "grid-tooltip"
    });

    marker.on("click", () => selectNode(id));

    state.markers[id] = marker;
    return marker;
}

function setupStaticMarkers() {
    addLocationMarker(
        "solar", "Solar Farm", nodeLocations.solar,
        "☀", "source", sourceLayer
    );

    addLocationMarker(
        "hydro", "Hydro Plant", nodeLocations.hydro,
        "≈", "source", sourceLayer
    );

    addLocationMarker(
        "wind", "Wind Farm", nodeLocations.wind,
        "✣", "source", sourceLayer
    );

    addLocationMarker(
        "substationA", "Substation A", nodeLocations.substationA,
        "⚡", "substation", substationLayer
    );

    addLocationMarker(
        "substationB", "Substation B", nodeLocations.substationB,
        "⚡", "substation", substationLayer
    );

    addLocationMarker(
        "substationC", "Substation C", nodeLocations.substationC,
        "⚡", "substation", substationLayer
    );

    addLocationMarker(
        "depot", "Repair Depot", nodeLocations.depot,
        "🛠", "substation", substationLayer
    );
}

// -------------------- Connected Nodes --------------------

function getConnectionsForNode(id) {
    return connections.filter(
        connection => connection.from === id || connection.to === id
    );
}

function getConnectedNodeNames(id) {
    const names = getConnectionsForNode(id).map(connection => {
        const otherId = connection.from === id
            ? connection.to
            : connection.from;

        return nodeNames[otherId] || otherId;
    });

    return names.length ? [...new Set(names)].join(", ") : "No connections";
}

function getNearestSubstation(coords) {
    const substations = [
        "substationA",
        "substationB",
        "substationC"
    ];

    let nearest = null;
    let shortestDistance = Infinity;

    substations.forEach(id => {
        const distance = distanceBetween(coords, nodeLocations[id]);

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearest = id;
        }
    });

    return nearest;
}


// -------------------- Draw Power Lines --------------------

function drawPowerLines() {
    lineLayer.clearLayers();
    state.lines = {};

    connections.forEach(connection => {
        const load = connection.loadId
            ? state.loads.find(item => item.id === connection.loadId)
            : null;

        let status = "normal";

        if (state.faults.has(connection.id)) {
            status = "fault";
        } else if (load) {
            status = getLineStatus(load);
        }

        const styles = {
            normal: {
                color: "#32d18b",
                weight: 3,
                opacity: 0.9
            },
            limited: {
                color: "#f2c14e",
                weight: 3,
                dashArray: "7 6",
                opacity: 0.95
            },
            fault: {
                color: "#ff6565",
                weight: 4,
                dashArray: "8 7",
                opacity: 1
            }
        };

        const points = [
            nodeLocations[connection.from],
            nodeLocations[connection.to]
        ];

        // Main connection line.
        const line = L.polyline(points, {
            ...styles[status],
            interactive: true
        }).addTo(lineLayer);

        line.bindTooltip(
            `${connection.id.replace("line-", "")}: ${status.toUpperCase()}`,
            { className: "grid-tooltip" }
        );

        state.lines[connection.id] = line;

        // Animated overlay for simulated energy flow.
        // The CSS class controls the moving dashes and their colors.
        if (status !== "fault") {
            L.polyline(points, {
                className: `power-flow-line ${status === "limited" ? "limited" : ""}`,
                color: status === "limited" ? "#f2c14e" : "#32d18b",
                weight: 4,
                opacity: 1,
                interactive: false,
                bubblingMouseEvents: false
            }).addTo(lineLayer);
        }
    });
}

// -------------------- Load Markers --------------------

function drawLoadMarkers() {
    loadLayer.clearLayers();

    loadDefinitions.forEach(load => {
        delete state.markers[load.id];
    });

    state.loads.forEach(load => {
        const coords = nodeLocations[load.id];
        if (!coords) return;

        const lineStatus = getLineStatus(load);

        const visualStatus =
            lineStatus === "fault" ? "fault" :
            lineStatus === "limited" ? "limited" :
            load.status === "Off" ? "off" : "active";

        const marker = L.marker(coords, {
            icon: createMarkerIcon(load.icon, "load", visualStatus)
        }).addTo(loadLayer);

        marker.bindTooltip(
            `${load.name}<br>${formatPower(load.received)} / ${formatPower(load.required)}`,
            { className: "grid-tooltip" }
        );

        marker.on("click", () => selectNode(load.id));
        state.markers[load.id] = marker;
    });
}

// -------------------- Summary and Generation Panel --------------------

function updateSummary(data) {
    const totalDemand = state.loads.reduce(
        (sum, load) => sum + load.required, 0
    );

    const totalAllocated = state.loads.reduce(
        (sum, load) => sum + load.received, 0
    );

    getElement("totalGeneration").textContent =
        formatPower(data.totalGeneration);

    getElement("totalDemand").textContent = formatPower(totalDemand);
    getElement("totalAllocated").textContent = formatPower(totalAllocated);

    getElement("unservedDemand").textContent =
        formatPower(totalDemand - totalAllocated);

    getElement("solarValue").textContent = formatPower(data.generation.solar);
    getElement("hydroValue").textContent = formatPower(data.generation.hydro);
    getElement("windValue").textContent = formatPower(data.generation.wind);
    getElement("sourceTotal").textContent = formatPower(data.totalGeneration);
}

// -------------------- Allocation Panel --------------------

function updateAllocationPanel() {
    const container = getElement("allocationList");
    container.replaceChildren();

    state.loads.forEach(load => {
        const item = document.createElement("div");
        item.className = "allocation-item";

        const top = document.createElement("div");
        top.className = "allocation-top";

        const nameBlock = document.createElement("div");

        const name = document.createElement("div");
        name.className = "allocation-name";
        name.textContent = `${load.icon} ${load.name}`;

        const priority = document.createElement("div");
        priority.className = "priority-label";
        priority.textContent =
            `${getPriorityLabel(load.priority)} · ${load.status}`;

        nameBlock.append(name, priority);

        const value = document.createElement("div");
        value.className = "allocation-value";
        value.textContent =
            `${load.received.toLocaleString()} / ${load.required.toLocaleString()} kW`;

        top.append(nameBlock, value);

        const track = document.createElement("div");
        track.className = "allocation-track";

        const fill = document.createElement("div");
        fill.className = "allocation-fill";

        if (load.status === "Limited") fill.classList.add("limited");
        if (load.status === "Off") fill.classList.add("off");

        fill.style.width = `${load.percentage}%`;
        track.appendChild(fill);

        item.append(top, track);

        item.addEventListener("click", () => {
            selectNode(load.id);

            if (state.markers[load.id]) {
                map.setView(nodeLocations[load.id], 15);
                state.markers[load.id].openTooltip();
            }
        });

        container.appendChild(item);
    });
}

// -------------------- Node Detail Panel --------------------

function setDetail(id, value) {
    const element = getElement(id);
    if (element) element.textContent = value;
}

function selectNode(id) {
    state.selectedNode = id;

    const name = nodeNames[id] || id;
    const connected = getConnectedNodeNames(id);

    // Selecting a node also displays it as the current endpoint.
    const startSelect = getElement("startNodeSelect");
    const startId = startSelect ? startSelect.value : "";

    updateEnergyEndpoints(startId, id);

    // Generation source details.
    if (sourceInfo[id]) {
        const data = readInputs();
        const output = data.generation[id];
        const connectionsForNode = getConnectionsForNode(id);

        setDetail("selectedNodeName", `${sourceInfo[id].icon} ${name}`);
        setDetail("detailType", sourceInfo[id].type);
        setDetail("detailStatus", output > 0 ? "Generating" : "Inactive");
        setDetail("detailRequired", "Not applicable");
        setDetail("detailReceived", formatPower(output));
        setDetail("detailDeficit", "—");
        setDetail("detailPriority", "—");
        setDetail("detailPercentage", output > 0 ? "100%" : "0%");
        setDetail("detailCapacity", formatPower(output));
        // Remaining Power detail was removed from the HTML.
        setDetail("detailConnected", connected);
        setDetail("detailSource", "Generation source");
        setDetail("detailDistance", connectionsForNode.length
            ? formatDistance(connectionDistance(connectionsForNode[0]))
            : "—");

        getElement("detailProgress").style.width = output > 0 ? "100%" : "0%";
        getElement("detailProgress").style.background = "#32d18b";
        return;
    }

    // Substation details.
    if (substationNames[id]) {
        const connectedLoads = state.loads.filter(load =>
            getConnectionsForNode(id).some(connection =>
                connection.loadId === load.id
            )
        );

        const output = connectedLoads.reduce(
            (sum, load) => sum + load.received, 0
        );

        const faulted = getConnectionsForNode(id).some(
            connection => state.faults.has(connection.id)
        );

        setDetail("selectedNodeName", `⚡ ${name}`);
        setDetail("detailType", "Substation / Transformer");
        setDetail("detailStatus", faulted ? "Fault on connected line" : "Connected");
        setDetail("detailRequired", formatPower(
            connectedLoads.reduce((sum, load) => sum + load.required, 0)
        ));
        setDetail("detailReceived", formatPower(output));
        setDetail("detailDeficit", formatPower(
            connectedLoads.reduce((sum, load) => sum + load.deficit, 0)
        ));
        setDetail("detailPriority", "Multiple loads");
        setDetail("detailPercentage", "—");
        setDetail("detailCapacity", "Not configured");
        setDetail("detailConnected", connected);
        setDetail("detailSource", "Connected generation and grid lines");
        setDetail("detailDistance", "Varies by route");

        getElement("detailProgress").style.width = "0%";
        getElement("detailProgress").style.background = "#32d18b";
        return;
    }

    // Repair depot details.
    if (id === "depot") {
        setDetail("selectedNodeName", "🛠 Repair Depot");
        setDetail("detailType", "Repair Team Depot");
        setDetail("detailStatus", "Available for demonstration");
        setDetail("detailRequired", "—");
        setDetail("detailReceived", "—");
        setDetail("detailDeficit", "—");
        setDetail("detailPriority", "—");
        setDetail("detailPercentage", "—");
        setDetail("detailCapacity", "—");
        setDetail("detailConnected", "No direct power connection");
        setDetail("detailSource", "Repair location");
        setDetail("detailDistance", "Use repair route");

        getElement("detailProgress").style.width = "0%";
        return;
    }

    // Load details.
    const load = state.loads.find(item => item.id === id);

    if (!load) {
        setDetail("selectedNodeName", name);
        setDetail("detailType", "Unknown node");
        return;
    }

    const feeder = connections.find(connection => connection.loadId === id);
    const sourceSubstation = feeder ? feeder.from : null;
    const faulted = feeder && state.faults.has(feeder.id);

    setDetail("selectedNodeName", `${load.icon} ${load.name}`);
    setDetail("detailType", "Distribution Load");
    setDetail("detailStatus", faulted ? "Fault on feeder" : load.status);
    setDetail("detailRequired", formatPower(load.required));
    setDetail("detailReceived", formatPower(load.received));
    setDetail("detailDeficit", formatPower(load.deficit));
    setDetail("detailPriority", getPriorityLabel(load.priority));
    setDetail("detailPercentage", `${load.percentage}%`);
    setDetail("detailCapacity", "—");
    setDetail("detailConnected", sourceSubstation
        ? nodeNames[sourceSubstation]
        : connected);
    setDetail("detailSource", sourceSubstation
        ? nodeNames[sourceSubstation]
        : "Not assigned");
    setDetail("detailDistance", feeder
        ? formatDistance(connectionDistance(feeder))
        : "—");

    getElement("detailProgress").style.width = `${load.percentage}%`;
    getElement("detailProgress").style.background =
        load.status === "Off" ? "#ff6565" :
        load.status === "Limited" ? "#f2c14e" : "#32d18b";
}
