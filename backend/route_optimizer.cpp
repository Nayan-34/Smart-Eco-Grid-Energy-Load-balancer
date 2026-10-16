#include "route_optimizer.h"

#include <iostream>
#include <sstream>
#include <iomanip> 
#include <curl/curl.h>
#include <nlohmann/json.hpp> 

using namespace std;
using json = nlohmann::json;

size_t writeResponse(void* contents, size_t size, size_t count, void* userData)
{
    size_t total = size * count;
    string* response = static_cast<string*>(userData);
    response->append(static_cast<char*>(contents), total);
    return total;
}

RouteResult RouteOptimizer::findShortestRoute(Location start, Location end)
{
    RouteResult result = {false, 0, 0, ""};

    if (start.latitude < -90 || start.latitude > 90 ||
        end.latitude < -90 || end.latitude > 90 ||
        start.longitude < -180 || start.longitude > 180 ||
        end.longitude < -180 || end.longitude > 180)
    {
        cout << "Invalid coordinates." << endl;
        return result;
    }

    ostringstream url;
    url << fixed << setprecision(7) 
        << "https://router.project-osrm.org/route/v1/driving/"
        << start.longitude << "," << start.latitude << ";"
        << end.longitude << "," << end.latitude
        << "?overview=full&geometries=geojson";
        
    string urlString = url.str();
    CURL* curl = curl_easy_init();

    if (curl == nullptr) return result;

    string response;
    curl_easy_setopt(curl, CURLOPT_URL, urlString.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeResponse);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 20L);

    CURLcode status = curl_easy_perform(curl);

    long httpStatus = 0;
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &httpStatus);
    curl_easy_cleanup(curl);

    if (status != CURLE_OK || httpStatus != 200)
    {
        cout << "Route request failed." << endl;
        return result;
    }

    try
    {
        json data = json::parse(response);

        if (!data.contains("code") || data["code"] != "Ok" ||
            !data.contains("routes") || !data["routes"].is_array() ||
            data["routes"].empty())
        {
            return result;
        }

        json route = data["routes"][0];
        result.distanceKm = route["distance"].get<double>() / 1000.0;
        result.durationMinutes = route["duration"].get<double>() / 60.0;
        result.geometry = route["geometry"].dump();
        result.success = true;
    }
    catch (const json::exception& e)
    {
        cout << "JSON parsing error: " << e.what() << endl;
    }

    return result;
}

DijkstraResult RouteOptimizer::findShortestPath(int nodeCount, 
                                                const vector<vector<GraphEdge>>& graph, 
                                                int startNode, 
                                                int endNode)
{
    DijkstraResult result = {false, 0, {}};
    return result;
}