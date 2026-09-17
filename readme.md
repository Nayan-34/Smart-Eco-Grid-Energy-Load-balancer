# Green Grid Energy Load Balancer and Fault Detection

## Project Description

The Green Grid Energy Load Balancer and Fault Detection is a web-based project that focuses on managing electricity demand and handling grid faults. The system uses simulated energy and load data to monitor the grid, manage loads according to their priority, and help assign repair teams to fault locations.
The project combines a C++ backend with an HTML, CSS, and JavaScript dashboard to make the system easier to monitor and use.

## Problem Statement

Power generation can change depending on availability, especially when using sources like solar energy. At the same time, the grid may face problems such as overloads, voltage issues, or other faults.
Manual monitoring can take more time to identify problems and assign maintenance teams. Our project aims to make this process more organized by monitoring the grid, prioritizing important loads, detecting faults, and finding suitable routes for repair teams.

## Objectives
- Monitor energy generation, power demand, and grid status.
- Manage electrical loads according to their priority.
- Track repair team statuses such as Available, Assigned, In Progress, and Resolved.
- Find suitable routes to fault locations using Dijkstra's Algorithm.
- Display grid information and fault alerts through an interactive web dashboard.

## Team Members
- Shivangi Rana – Team Lead & Backend Developer
- Nayan Thapliyal – Frontend Developer & Tester
- Sanchi Aggrawal – Backend Developer
- Shikha Dhabral – Backend & Module Integration

## Technologies and Tools Used
- C++ – Backend and core logic
- HTML5 – Webpage structure
- CSS3 – Dashboard design
- JavaScript – Frontend interaction
- Dijkstra's Algorithm – Shortest-path routing
- Graphs & Priority Queue – DSA concepts
- VS Code / Code::Blocks – Development
- Git & GitHub – Version control and collaboration

## Major Features / Modules
1. Energy & Load Management
Handles simulated energy generation and electricity demand. Loads are given different priorities so important loads can be managed first when available power is limited.

2. Fault Management
Records and processes grid faults along with information such as fault location and severity.

3. Repair Team Dispatch
Keeps track of available repair teams and assigns a suitable team to a fault.

4. Dijkstra Shortest-Path Router
Represents grid locations and routes as a graph and uses Dijkstra's Algorithm to find a suitable shortest route to the fault location.

5. Web Dashboard
Provides a simple interface to view energy generation, demand, grid status, faults, and repair team information.

## Current Project Status

Phase I – Architecture & Core Logic

- Project problem and scope finalized.
- Requirements identified.
- Existing solutions studied.
- Basic system workflow designed.
- Initial planning of the C++ backend and web dashboard completed.

