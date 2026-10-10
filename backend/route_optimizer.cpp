
#include "route_optimizer.h"

RouteOptimizer::RouteOptimizer(int n)
{
    nodes = n;

    for (int i = 0; i < nodes; i++)
    {
        for (int j = 0; j < nodes; j++)
        {
            graph[i][j] = 0;
        }
    }
}

void RouteOptimizer::addConnection(int a, int b, int distance)
{
    graph[a][b] = distance;
    graph[b][a] = distance;
}

void RouteOptimizer::findShortestRoute(int start, int end)
{
    int distance[10];
    bool visited[10];

    for (int i = 0; i < nodes; i++)
    {
        distance[i] = INT_MAX;
        visited[i] = false;
    }

    distance[start] = 0;

    
}
