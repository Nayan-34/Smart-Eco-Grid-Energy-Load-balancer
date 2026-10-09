#ifndef ROUTE_OPTIMIZER_H
#define ROUTE_OPTIMIZER_H

#include <iostream>
#include <climits>

using namespace std;

class RouteOptimizer
{
private:
    int graph[10][10];
    int nodes;

public:
    RouteOptimizer(int n);

    void addConnection(int a, int b, int distance);

    void findShortestRoute(int start, int end);
};

#endif