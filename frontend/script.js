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
// -------------------- Grid Overview --------------------

function updateGridOverview() {
    demand = getTotalDemand();

    const balance = generation - demand;
    const supplied = getTotalSupplied();

    setText("generationValue", generation + " kW");
    setText("demandValue", demand + " kW");
    setText(
        "availablePower",
        (balance >= 0 ? "+" : "") + balance + " kW"
    );

    setText(
        "balanceLabel",
        balance >= 0 ? "Surplus power" : "Power shortage"
    );

    const gridStatus = getElement("gridStatus");
    const gridMessage = getElement("gridMessage");
    const balanceBadge = getElement("balanceBadge");
    const balanceInsight = getElement("balanceInsight");
    const balanceBar = getElement("balanceBar");

    if (balance >= 0) {
        setText("gridStatus", "Normal");
        setText("gridMessage", "Generation meets demand");

        if (gridStatus) {
            gridStatus.style.color = "#4f7657";
        }

        setText("balanceBadge", "SURPLUS");

        if (balanceBadge) {
            balanceBadge.className = "status-badge status-good";
        }

        setText(
            "balanceInsight",
            "Generation exceeds demand by " + balance + " kW."
        );

        if (balanceBar) {
            balanceBar.style.background = "#789b7d";
        }
    } else {
        setText("gridStatus", "Shortage");
        setText("gridMessage", "Demand is higher than generation");

        if (gridStatus) {
            gridStatus.style.color = "#a7473f";
        }

        setText("balanceBadge", "SHORTAGE");

        if (balanceBadge) {
            balanceBadge.className = "status-badge status-danger";
        }

        setText(
            "balanceInsight",
            "Demand exceeds generation by " + Math.abs(balance) + " kW."
        );

        if (balanceBar) {
            balanceBar.style.background = "#b95c52";
        }
    }

        // The bar represents generation compared with total demand.
    const scale = Math.max(generation, demand, 1);
    const percentage = Math.min((generation / scale) * 100, 100);

    if (balanceBar) {
        balanceBar.style.width = percentage + "%";
    }

    setText("balanceScale", "Comparison scale: " + scale + " kW");

    setText("totalRequired", demand + " kW");
    setText("totalSupplied", supplied + " kW");

    const limited = loads.filter(function (load) {
        return load.supplied < load.power;
    }).length;

    setText("limitedLoads", limited);

    updateLastUpdated();
}

// -------------------- Energy Generation --------------------

function updateGeneration() {
    generation = solar + hydro + wind;

    setText("solarGeneration", solar + " kW");
    setText("hydroGeneration", hydro + " kW");
    setText("windGeneration", wind + " kW");

    setText("flowGeneration", generation + " kW");
    setText("flowTransformer", generation + " kW");
}

// -------------------- Power Allocation --------------------

function allocatePower() {
    demand = getTotalDemand();

    // Higher priority numbers are allocated power first.
    const allocationOrder = loads.slice().sort(function (a, b) {
        return b.priority - a.priority;
    });

    let remainingPower = Math.max(generation, 0);

    allocationOrder.forEach(function (load) {
        const supplied = Math.min(load.power, remainingPower);

        load.supplied = supplied;
        remainingPower -= supplied;

        load.status = supplied >= load.power
            ? "Fully Supplied"
            : supplied > 0
                ? "Partially Supplied"
                : "Not Supplied";
    });

    renderLoadTable();
    renderNodeFlow();
    updatePowerDistribution();
    updateGridOverview();
    drawAllCharts();
}

// -------------------- Load Table --------------------

function renderLoadTable() {
    const table = getElement("loadTable");

    if (!table) return;

    table.replaceChildren();

    loads.forEach(function (load, index) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = load.name;

        const priorityCell = document.createElement("td");
        const priorityBadge = document.createElement("span");

        priorityBadge.className =
            "status-badge " + getPriorityClass(load.priority);

        priorityBadge.textContent = getPriorityName(load.priority);
        priorityCell.appendChild(priorityBadge);

        const requiredCell = document.createElement("td");
        requiredCell.textContent = load.power + " kW";

        const suppliedCell = document.createElement("td");
        suppliedCell.textContent = load.supplied + " kW";

        const allocationCell = document.createElement("td");
        allocationCell.className = "allocation-cell";

        const percentage = load.power > 0
            ? Math.round((load.supplied / load.power) * 100)
            : 0;

        allocationCell.appendChild(
            document.createTextNode(percentage + "%")
        );

        const track = document.createElement("div");
        track.className = "allocation-track";

        const fill = document.createElement("div");
        fill.className = "allocation-fill";
        fill.style.width = percentage + "%";

        track.appendChild(fill);
        allocationCell.appendChild(track);

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.className =
            "status-badge " +
            (percentage === 100
                ? "status-good"
                : percentage > 0
                    ? "status-warning"
                    : "status-danger");

        statusBadge.textContent = load.status;
        statusCell.appendChild(statusBadge);

        const actionCell = document.createElement("td");
        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "remove-button";
        removeButton.textContent = "Remove";
        removeButton.setAttribute("aria-label", "Remove " + load.name);

        removeButton.addEventListener("click", function () {
            removeLoad(index);
        });

        actionCell.appendChild(removeButton);

        row.append(
            nameCell,
            priorityCell,
            requiredCell,
            suppliedCell,
            allocationCell,
            statusCell,
            actionCell
        );

        table.appendChild(row);
    });

    setText(
        "loadCount",
        loads.length + (loads.length === 1 ? " load" : " loads")
    );
}
// -------------------- Add and Remove Loads --------------------

const loadForm = getElement("loadForm");

if (loadForm) {
    loadForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = getElement("loadName").value.trim();
        const power = Number(getElement("loadPower").value);
        const priority = Number(getElement("loadPriority").value);

        if (!name || !Number.isFinite(power) || power <= 0) {
            alert("Enter a valid load name and power value.");
            return;
        }

        if (![1, 2, 3].includes(priority)) {
            alert("Please select a valid priority.");
            return;
        }

        const duplicate = loads.some(function (load) {
            return load.name.toLowerCase() === name.toLowerCase();
        });

        if (duplicate) {
            alert("A load with this name already exists.");
            return;
        }

        loads.push({
            name: name,
            power: power,
            priority: priority,
            supplied: 0,
            status: "Not Supplied"
        });

        allocatePower();

        addActivity(
            "New load added: " + name,
            power + " kW required, priority " + priority + "."
        );

        loadForm.reset();
        getElement("loadName").focus();
    });
}

function removeLoad(index) {
    if (index < 0 || index >= loads.length) return;

    const removedLoad = loads[index];

    loads.splice(index, 1);
    allocatePower();

    addActivity(
        "Load removed: " + removedLoad.name,
        "The load was removed from the simulated grid."
    );
}

// -------------------- Node and Power-Flow Display --------------------

function renderNodeFlow() {
    const flowLoads = getElement("flowLoads");

    if (!flowLoads) return;

    flowLoads.replaceChildren();

    loads.forEach(function (load) {
        const card = document.createElement("article");
        card.className = "flow-load-card";

        const heading = document.createElement("h4");
        heading.textContent = load.name;

        const supplied = document.createElement("strong");
        supplied.textContent = load.supplied + " kW";

        const details = document.createElement("p");
        details.textContent =
            "Required: " + load.power + " kW";

        const status = document.createElement("p");
        status.textContent = load.status;

        card.append(heading, supplied, details, status);
        flowLoads.appendChild(card);
    });

    setText("flowDistributed", getTotalSupplied() + " kW");
}

function updatePowerDistribution() {
    setText("totalRequired", getTotalDemand() + " kW");
    setText("totalSupplied", getTotalSupplied() + " kW");
}

// -------------------- Horizontal Bar Charts --------------------

function drawHorizontalChart(canvasId, items, paired) {
    const canvas = getElement(canvasId);

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const width = Math.max(canvas.clientWidth, 280);

    const rowCount = items.length;
    const rowHeight = paired ? 54 : 47;
    const height = Math.max(220, rowCount * rowHeight + 65);

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.style.height = height + "px";
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    const leftMargin = Math.min(
        150,
        Math.max(95, width * 0.30)
    );

    const rightMargin = 55;
    const topMargin = 24;
    const bottomMargin = 34;

    const chartWidth = Math.max(
        50,
        width - leftMargin - rightMargin
    );

    const values = [];

    items.forEach(function (item) {
        values.push(item.value || 0);

        if (paired) {
            values.push(item.required || 0);
            values.push(item.supplied || 0);
        }
    });

    const largestValue = Math.max(...values, 1);

    // Use a readable rounded scale.
    const scaleStep = Math.pow(
        10,
        Math.floor(Math.log10(largestValue))
    );

    const maximum = Math.ceil(
        largestValue / scaleStep
    ) * scaleStep;

    const chartHeight = height - topMargin - bottomMargin;

    context.font = "11px Arial, sans-serif";
    context.textBaseline = "middle";

    // Vertical grid lines and scale labels.
    for (let tick = 0; tick <= 4; tick++) {
        const x = leftMargin + (chartWidth * tick / 4);
        const value = Math.round(maximum * tick / 4);

        context.beginPath();
        context.strokeStyle = "#e2e8e2";
        context.lineWidth = 1;
        context.moveTo(x, topMargin - 5);
        context.lineTo(x, height - bottomMargin);
        context.stroke();

        context.fillStyle = "#6b756e";
        context.textAlign = "center";
        context.fillText(String(value), x, height - 16);
    }

    items.forEach(function (item, index) {
        const centerY = topMargin +
            (chartHeight / rowCount) * (index + 0.5);

        context.textAlign = "right";
        context.fillStyle = "#34473a";
        context.font = "12px Arial, sans-serif";

        context.fillText(
            item.label,
            leftMargin - 10,
            paired ? centerY - 7 : centerY,
            leftMargin - 18
        );

        if (paired) {
            const barHeight = 10;
            const requiredWidth =
                chartWidth * (item.required || 0) / maximum;
            const suppliedWidth =
                chartWidth * (item.supplied || 0) / maximum;

            context.fillStyle = "#b9c9ba";
            context.fillRect(
                leftMargin,
                centerY - 16,
                requiredWidth,
                barHeight
            );

            context.fillStyle = "#4f7657";
            context.fillRect(
                leftMargin,
                centerY + 1,
                suppliedWidth,
                barHeight
            );

            context.textAlign = "left";
            context.fillStyle = "#34473a";
            context.font = "10px Arial, sans-serif";

            context.fillText(
                String(item.required || 0),
                Math.min(leftMargin + requiredWidth + 4, width - 27),
                centerY - 11
            );

            context.fillText(
                String(item.supplied || 0),
                Math.min(leftMargin + suppliedWidth + 4, width - 27),
                centerY + 6
            );
        } else {
            const barHeight = Math.min(24, chartHeight / rowCount * 0.5);
            const barWidth = chartWidth * (item.value || 0) / maximum;

            context.fillStyle = item.color || "#789b7d";

            context.fillRect(
                leftMargin,
                centerY - barHeight / 2,
                barWidth,
                barHeight
            );

            context.textAlign = "left";
            context.fillStyle = "#26352d";
            context.font = "bold 11px Arial, sans-serif";

            context.fillText(
                String(item.value || 0) + " kW",
                Math.min(leftMargin + barWidth + 5, width - 42),
                centerY
            );
        }
    });
}

function drawAllCharts() {
    drawHorizontalChart("generationChart", [
        { label: "Solar", value: solar, color: "#789b7d" },
        { label: "Hydro", value: hydro, color: "#638b70" },
        { label: "Wind", value: wind, color: "#9ab49c" }
    ], false);

    drawHorizontalChart("generationDemandChart", [
        { label: "Generation", value: generation, color: "#4f7657" },
        { label: "Demand", value: demand, color: "#b9a36b" }
    ], false);

    drawHorizontalChart(
        "loadAllocationChart",
        loads.map(function (load) {
            return {
                label: load.name,
                required: load.power,
                supplied: load.supplied
            };
        }),
        true
    );
}
// -------------------- Fault Management --------------------

const faultForm = getElement("faultForm");

if (faultForm) {
    faultForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const type = getElement("faultType").value;
        const location = getElement("faultLocation").value;
        const severity = getElement("faultSeverity").value;

        setText("currentFaultType", type);
        setText("currentFaultLocation", location);
        setText("currentFaultSeverity", severity);
        setText("faultBadge", "Reported");

        const faultBadge = getElement("faultBadge");

        if (faultBadge) {
            faultBadge.className =
                "status-badge " +
                (severity === "High"
                    ? "status-danger"
                    : severity === "Medium"
                        ? "status-warning"
                        : "status-good");
        }

        addActivity(
            severity + "-severity fault reported",
            type + " fault at " + location + "."
        );

        calculateRepairRoute(location);
    });
}

// -------------------- Weighted Graph --------------------

// Distances are illustrative values for the project prototype.
const gridGraph = {
    "Team A": { "Substation A": 3 },
    "Team B": { "Substation C": 2 },
    "Team C": { "Substation D": 4 },

    "Substation A": {
        "Team A": 3,
        "Substation B": 5
    },

    "Substation B": {
        "Substation A": 5,
        "Substation C": 3,
        "Substation D": 7
    },

    "Substation C": {
        "Team B": 2,
        "Substation B": 3
    },

    "Substation D": {
        "Team C": 4,
        "Substation B": 7
    }
};

// -------------------- Dijkstra's Algorithm --------------------

function dijkstra(graph, start, target) {
    const distance = {};
    const previous = {};
    const visited = {};

    const nodes = Object.keys(graph);

    nodes.forEach(function (node) {
        distance[node] = Infinity;
        previous[node] = null;
        visited[node] = false;
    });

    if (!(start in distance) || !(target in distance)) {
        return { distance: Infinity, path: [] };
    }

    distance[start] = 0;

    for (let count = 0; count < nodes.length; count++) {
        let current = null;
        let smallestDistance = Infinity;

        nodes.forEach(function (node) {
            if (
                !visited[node] &&
                distance[node] < smallestDistance
            ) {
                smallestDistance = distance[node];
                current = node;
            }
        });

        if (current === null) break;
        if (current === target) break;

        visited[current] = true;

        const neighbours = graph[current];

        for (const neighbour in neighbours) {
            if (visited[neighbour]) continue;

            const newDistance =
                distance[current] + neighbours[neighbour];

            if (newDistance < distance[neighbour]) {
                distance[neighbour] = newDistance;
                previous[neighbour] = current;
            }
        }
    }

    if (!Number.isFinite(distance[target])) {
        return { distance: Infinity, path: [] };
    }

    const path = [];
    let node = target;

    while (node !== null) {
        path.unshift(node);
        node = previous[node];
    }

    if (path[0] !== start) {
        return { distance: Infinity, path: [] };
    }

    return {
        distance: distance[target],
        path: path
    };
}


// -------------------- Repair Team Selection --------------------

function selectRepairTeam(location) {
    let bestChoice = null;

    teams.forEach(function (team) {
        if (!team.available) return;

        const result = dijkstra(
            gridGraph,
            team.name,
            location
        );

        if (result.path.length === 0) return;

        if (
            bestChoice === null ||
            result.distance < bestChoice.result.distance
        ) {
            bestChoice = {
                team: team,
                result: result
            };
        }
    });

    return bestChoice;
}

function calculateRepairRoute(location) {
    const selection = selectRepairTeam(location);

    if (selection === null) {
        setText("selectedTeam", "No available team");
        setText("routeDistance", "--");
        setText("repairRoute", "No route found.");
        setText("routeStatus", "Unavailable");

        const status = getElement("routeStatus");

        if (status) {
            status.className = "status-badge status-danger";
        }

        renderTeams(null);

        addActivity(
            "Route calculation failed",
            "No available repair team could reach " + location + "."
        );

        return;
    }

    setText("selectedTeam", selection.team.name);
    setText("routeDistance", selection.result.distance + " km");
    setText("repairRoute", selection.result.path.join(" → "));
    setText("routeStatus", "Route Found");

    const status = getElement("routeStatus");

    if (status) {
        status.className = "status-badge status-good";
    }

    renderTeams(selection.team.name);

    addActivity(
        "Repair route calculated",
        selection.team.name + " selected for " + location +
        "; estimated route distance " + selection.result.distance + " km."
    );
}

function renderTeams(selectedTeamName) {
    const teamGrid = getElement("teamGrid");

    if (!teamGrid) return;

    teamGrid.replaceChildren();

    teams.forEach(function (team) {
        const card = document.createElement("article");
        card.className = "team-card";

        if (team.name === selectedTeamName) {
            card.classList.add("selected-team");
        }

        const heading = document.createElement("h3");
        heading.textContent = team.name;

        const description = document.createElement("p");

        description.textContent = team.available
            ? team.name === selectedTeamName
                ? "Selected for this repair"
                : "Available for assignment"
            : "Currently occupied";

        const badge = document.createElement("span");

        if (!team.available) {
            badge.className = "status-badge status-warning";
            badge.textContent = "Busy";
        } else if (team.name === selectedTeamName) {
            badge.className = "status-badge status-good";
            badge.textContent = "Selected";
        } else {
            badge.className = "status-badge status-good";
            badge.textContent = "Available";
        }

        card.append(heading, description, badge);
        teamGrid.appendChild(card);
    });
}
// -------------------- Recent Activity --------------------

function addActivity(title, description) {
    const activityList = getElement("activityList");

    if (!activityList) return;

    const emptyMessage = activityList.querySelector(".empty-activity");

    if (emptyMessage) {
        emptyMessage.remove();
    }

    const item = document.createElement("div");
    item.className = "activity-item";

    const dot = document.createElement("span");
    dot.className = "activity-dot";

    const content = document.createElement("div");

    const heading = document.createElement("strong");
    heading.textContent = title;

    const details = document.createElement("p");
    details.textContent = getCurrentTime() + " — " + description;

    content.append(heading, details);
    item.append(dot, content);

    activityList.prepend(item);

    // Keep the latest eight activity entries.
    while (activityList.children.length > 8) {
        activityList.lastElementChild.remove();
    }
}

function clearActivity() {
    const activityList = getElement("activityList");

    if (!activityList) return;

    activityList.replaceChildren();

    const message = document.createElement("p");
    message.className = "empty-activity";
    message.textContent = "No activity recorded yet.";

    activityList.appendChild(message);
}

const clearActivityButton = getElement("clearActivity");

if (clearActivityButton) {
    clearActivityButton.addEventListener("click", clearActivity);
}

// -------------------- Simulation Controls --------------------

function updateSimulationButtons() {
    const start = getElement("startSimulation");
    const pause = getElement("pauseSimulation");

    if (start) start.disabled = simulationRunning;
    if (pause) pause.disabled = !simulationRunning;

    setText(
        "simulationMessage",
        simulationRunning
            ? "Simulation is running. Values update every three seconds."
            : "Simulation is currently paused."
    );
}

function startSimulation() {
    if (simulationRunning) return;

    simulationRunning = true;
    updateSimulationButtons();

    simulationTimer = setInterval(function () {
        // Vary the renewable sources by small simulated amounts.
        solar = Math.max(
            0,
            solar + Math.floor(Math.random() * 61) - 30
        );

        hydro = Math.max(
            0,
            hydro + Math.floor(Math.random() * 31) - 15
        );

        wind = Math.max(
            0,
            wind + Math.floor(Math.random() * 81) - 40
        );

        updateGeneration();
        allocatePower();

    }, 3000);

    addActivity(
        "Simulation started",
        "Generation readings are now changing."
    );
}

function pauseSimulation() {
    if (simulationTimer !== null) {
        clearInterval(simulationTimer);
        simulationTimer = null;
    }

    const wasRunning = simulationRunning;
    simulationRunning = false;
    updateSimulationButtons();

    if (wasRunning) {
        addActivity(
            "Simulation paused",
            "The simulated readings have stopped changing."
        );
    }
}

function resetSimulation() {
    pauseSimulation();

    loads = initialLoads.map(function (load) {
        return {
            ...load,
            supplied: 0,
            status: "Active"
        };
    });

    solar = 1000;
    hydro = 800;
    wind = 700;

    teams = initialTeams.map(function (team) {
        return { ...team };
    });

    updateGeneration();
    allocatePower();
