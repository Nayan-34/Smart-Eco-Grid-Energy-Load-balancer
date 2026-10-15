
#include "route_optimizer.h"
#include <iostream>
#include <climits>
using namespace std;

void RouteOptimizer::findShortestRoute(int start, int end)
{
    int distance[10];
    bool visited[10];

    for (int i = 0; i < 10; i++)
    {
        distance[i] = INT_MAX;
        visited[i] = false;
    }

    distance[start] = 0;

    for (int i = 0; i < 10; i++)
    {
        int current = -1;

        for (int j = 0; j < 10; j++)
        {
            if (!visited[j] &&
                (current == -1 ||
                 distance[j] < distance[current]))
            {
                current = j;
            }
        }

        if (current == -1 || distance[current] == INT_MAX)
            break;

        visited[current] = true;

        if (current == end)
            break;
    }

    if (distance[end] == INT_MAX)
        cout << "No route found." << endl;
    else
        cout << "Shortest distance: " << distance[end] << endl;
}
