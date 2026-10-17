
#include <iostream>
#include <vector>
#include <iomanip>
#include "energy_load.h"
#include "fault_manager.h"
#include "route_optimizer.h"
#include "repair_team_manager.h"

using namespace std;

int main()
{
    cout << "Smart Eco-Grid Backend" << endl;
    cout << "----------------------" << endl;

    GridNode grid(500, 1000, 200);
    LoadManager manager;

    manager.addConsumer("Hospital", HIGH, 200);
    manager.addConsumer("School", MEDIUM, 150);
    manager.addConsumer("Office", LOW, 100);
    manager.addConsumer("Emergency Center", HIGH, 250);

    cout << "\n--- Energy Load Management ---" << endl;
    manager.processGrid(grid);

    FaultManager faultManager;

    cout << "\n--- Fault Detection ---" << endl;
    faultManager.checkFault(1, "Substation B", 185, 80);
    faultManager.checkFault(2, "Substation C", 220, 120);
    faultManager.showFaults();

    RepairTeamManager repairManager;

    cout << "\n--- Repair Team Management ---" << endl;
    repairManager.addTeam("Team Alpha");
    repairManager.addTeam("Team Beta");
    repairManager.addTeam("Team Gamma");

    repairManager.showTeams();
    repairManager.assignTeam();
    repairManager.showTeams();

    cout << "\n--- Dijkstra Route Optimization ---" << endl;

    vector<vector<GraphEdge>> graph(7);

    auto addEdge = [&](int u, int v, double weight)
    {
        graph[u].push_back({v, weight});
        graph[v].push_back({u, weight});
    };

    addEdge(0, 1, 4);
    addEdge(0, 2, 2);
    addEdge(1, 3, 5);
    addEdge(1, 4, 10);
    addEdge(2, 3, 8);
    addEdge(2, 5, 7);
    addEdge(3, 6, 3);
    addEdge(4, 6, 4);
    addEdge(5, 6, 6);

    const string nodeNames[] = {
        "Power Plant",
        "Metro Hospital",
        "Telecom Hub",
        "Water Plant",
        "City Schools",
        "Offices",
        "Suburbs"
    };

    RouteOptimizer route;

    DijkstraResult pathResult =
        route.findShortestPath(7, graph, 0, 3);

    if (pathResult.success)
    {
        cout << "Shortest path: ";

        for (size_t i = 0; i < pathResult.path.size(); i++)
        {
            cout << "N" << pathResult.path[i]
                 << " (" << nodeNames[pathResult.path[i]] << ")";

            if (i + 1 < pathResult.path.size())
                cout << " -> ";
        }

        cout << "\nTotal path cost: "
             << pathResult.totalDistance << endl;
    }

    cout << "\n--- Road Route using OSRM ---" << endl;

    Location teamLocation = {30.3165, 78.0322};
    Location faultLocation = {30.3250, 78.0410};

    RouteResult roadResult =
        route.findShortestRoute(teamLocation, faultLocation);

    if (roadResult.success)
    {
        cout << fixed << setprecision(2);
        cout << "Road distance: "
             << roadResult.distanceKm << " km" << endl;
        cout << "Travel time: "
             << roadResult.durationMinutes << " minutes" << endl;
        cout << "Route geometry: "
             << roadResult.geometry << endl;
    }

    cout << "\nEco-Grid backend execution completed." << endl;

    return 0;
}
