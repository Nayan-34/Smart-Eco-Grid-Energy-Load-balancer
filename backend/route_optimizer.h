#ifndef ROUTE_OPTIMIZER_H
#define ROUTE_OPTIMIZER_H

#include <vector>

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
    DijkstraResult findShortestPath(
        int nodeCount,
        const std::vector<std::vector<GraphEdge>>& graph,
        int startNode,
        int endNode
    );
};

#endif
