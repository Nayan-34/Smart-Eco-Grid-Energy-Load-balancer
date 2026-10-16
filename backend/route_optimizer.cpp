#include "route_optimizer.h"

#include <iostream>
#include <sstream>
#include <iomanip> 
#include <curl/curl.h>

using namespace std;

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
        
    return result;
}