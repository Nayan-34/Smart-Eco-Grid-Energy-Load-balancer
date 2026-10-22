#include "route_optimizer.h"
#include <limits>
#include <queue>
#include <algorithm>

using namespace std;

DijkstraResult RouteOptimizer::findShortestPath(
    int nodeCount,
    const vector<vector<GraphEdge>>& graph,
    int startNode,
    int endNode
)
{
    DijkstraResult result = {false, 0, {}};

    if (nodeCount <= 0 ||
        graph.size() != static_cast<size_t>(nodeCount) ||
        startNode < 0 || startNode >= nodeCount ||
        endNode < 0 || endNode >= nodeCount)
    {
        return result;
    }

    const double INF = numeric_limits<double>::infinity();
    vector<double> distance(nodeCount, INF);
    vector<int> parent(nodeCount, -1);

    using NodeRecord = pair<double, int>;
    priority_queue<NodeRecord, vector<NodeRecord>, greater<NodeRecord>> pq;

    distance[startNode] = 0.0;
    pq.push({0.0, startNode});

    while (!pq.empty())
    {
        double currentDist = pq.top().first;
        int current = pq.top().second;
        pq.pop();

        if (currentDist > distance[current])
        {
            continue;
        }

        if (current == endNode)
        {
            break;
        }

        for (const auto& edge : graph[current])
        {
            if (edge.destination < 0 ||
                edge.destination >= nodeCount ||
                edge.weight < 0)
            {
                return result;
            }

            int next = edge.destination;
            double newDistance = currentDist + edge.weight;

            if (newDistance < distance[next])
            {
                distance[next] = newDistance;
                parent[next] = current;
                pq.push({newDistance, next});
            }
        }
    }

    if (distance[endNode] == INF)
    {
        return result;
    }

    for (int node = endNode; node != -1; node = parent[node])
    {
        result.path.push_back(node);
    }

    reverse(result.path.begin(), result.path.end());

    result.success = true;
    result.totalDistance = distance[endNode];

    return result;
}

