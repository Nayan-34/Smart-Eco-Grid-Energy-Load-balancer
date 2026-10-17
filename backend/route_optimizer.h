
#ifndef ROUTE_OPTIMIZER_H
#define ROUTE_OPTIMIZER_H

#include <string>
#include <vector>

struct Location
{
    double latitude;
    double longitude;
};

struct RouteResult
{
    bool success;
    double distanceKm;
    double durationMinutes;
    std::string geometry;
};

struct GraphEdge
{
    int destination;
    double weight;
};

struct DijkstraResult
{
    bool success;
    double totalDistance;
    std::vector<int> path;
};

class RouteOptimizer
{
public:
    // Finds a real-world road route using OSRM.
    RouteResult findShortestRoute(Location start, Location end);

    // Finds the shortest path through the Eco Grid graph using Dijkstra.
    DijkstraResult findShortestPath(
        int nodeCount,
        const std::vector<std::vector<GraphEdge>>& graph,
        int startNode,
        int endNode
    );
};

#endif
