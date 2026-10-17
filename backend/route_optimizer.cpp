
#include "route_optimizer.h"

#include <iostream>
#include <sstream>
#include <iomanip>
#include <limits>
#include <curl/curl.h>
#include <nlohmann/json.hpp>
#include <queue>
#include <algorithm>

using namespace std;
using json = nlohmann::json;

// Receives the response returned by the OSRM API.
size_t writeResponse(
    void* contents,
    size_t size,
    size_t count,
    void* userData
)
{
    size_t total = size * count;

    string* response = static_cast<string*>(userData);

    response->append(static_cast<char*>(contents), total);

    return total;
}

// Finds a real-world driving route using OSRM.
RouteResult RouteOptimizer::findShortestRoute(
    Location start,
    Location end
)
{
    RouteResult result = {false, 0, 0, ""};

    // Validate latitude and longitude.
    if (start.latitude < -90 || start.latitude > 90 ||
        end.latitude < -90 || end.latitude > 90 ||
        start.longitude < -180 || start.longitude > 180 ||
        end.longitude < -180 || end.longitude > 180)
    {
        cout << "Invalid coordinates." << endl;
        return result;
    }

    // Construct the OSRM API URL.
    ostringstream url;

    url << fixed << setprecision(7)
        << "https://router.project-osrm.org/route/v1/driving/"
        << start.longitude << "," << start.latitude << ";"
        << end.longitude << "," << end.latitude
        << "?overview=full&geometries=geojson";

    string urlString = url.str();

    CURL* curl = curl_easy_init();

    if (curl == nullptr)
    {
        cout << "Failed to initialize CURL." << endl;
        return result;
    }

    string response;

    curl_easy_setopt(curl, CURLOPT_URL, urlString.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeResponse);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 20L);

    // Send the API request.
    CURLcode status = curl_easy_perform(curl);

    long httpStatus = 0;

    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &httpStatus);

    curl_easy_cleanup(curl);

    // Check for network or HTTP errors.
    if (status != CURLE_OK || httpStatus != 200)
    {
        cout << "Route request failed." << endl;
        return result;
    }

    try
    {
        json data = json::parse(response);

        // Check whether OSRM returned a valid route.
        if (!data.contains("code") ||
            data["code"] != "Ok" ||
            !data.contains("routes") ||
            !data["routes"].is_array() ||
            data["routes"].empty())
        {
            cout << "No valid route found." << endl;
            return result;
        }

        json route = data["routes"][0];

        // Convert metres to kilometres.
        result.distanceKm =
            route["distance"].get<double>() / 1000.0;

        // Convert seconds to minutes.
        result.durationMinutes =
            route["duration"].get<double>() / 60.0;

        // Store the route geometry as a JSON string.
        result.geometry = route["geometry"].dump();

        result.success = true;
    }
    catch (const json::exception& e)
    {
        cout << "JSON parsing error: "
             << e.what() << endl;
    }

    return result;
}

// Finds the shortest path through the Eco Grid graph using Dijkstra.
DijkstraResult RouteOptimizer::findShortestPath(
    int nodeCount,
    const vector<vector<GraphEdge>>& graph,
    int startNode,
    int endNode
)
{
    DijkstraResult result = {false, 0, {}};

    // Validate the graph and node numbers.
    if (nodeCount <= 0 ||
        graph.size() != static_cast<size_t>(nodeCount) ||
        startNode < 0 || startNode >= nodeCount ||
        endNode < 0 || endNode >= nodeCount)
    {
        cout << "Invalid graph or node numbers." << endl;
        return result;
    }

    const double INF = numeric_limits<double>::infinity();

    vector<double> distance(nodeCount, INF);
    vector<int> parent(nodeCount, -1);

    // Store {distance, node} pairs in a minimum-priority queue.
    using NodeRecord = pair<double, int>;

    priority_queue<
        NodeRecord,
        vector<NodeRecord>,
        greater<NodeRecord>
    > pq;

    distance[startNode] = 0.0;

    pq.push({0.0, startNode});

    while (!pq.empty())
    {
        double currentDist = pq.top().first;
        int current = pq.top().second;

        pq.pop();

        // Ignore outdated queue entries.
        if (currentDist > distance[current])
        {
            continue;
        }

        // The shortest distance to the destination is finalized.
        if (current == endNode)
        {
            break;
        }

        for (const auto& edge : graph[current])
        {
            // Validate the destination index and edge weight.
            if (edge.destination < 0 ||
                edge.destination >= nodeCount ||
                edge.weight < 0)
            {
                cout << "Invalid graph edge." << endl;
                return result;
            }

            int next = edge.destination;

            double newDistance = currentDist + edge.weight;

            // Update the distance if a shorter path is found.
            if (newDistance < distance[next])
            {
                distance[next] = newDistance;
                parent[next] = current;

                pq.push({newDistance, next});
            }
        }
    }

    // The destination cannot be reached.
    if (distance[endNode] == INF)
    {
        cout << "No path exists between the given nodes." << endl;
        return result;
    }

    // Reconstruct the path from destination to source.
    for (int node = endNode;
         node != -1;
         node = parent[node])
    {
        result.path.push_back(node);
    }

    // Reverse the path to get source-to-destination order.
    reverse(result.path.begin(), result.path.end());

    result.success = true;
    result.totalDistance = distance[endNode];

    return result;
}
