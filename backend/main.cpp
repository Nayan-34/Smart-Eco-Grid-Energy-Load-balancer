#include <iostream>
#include <vector>
#include <iomanip>
#include <fstream>
#include <nlohmann/json.hpp>
#include "energy_load.h"
#include "fault_manager.h"
#include "route_optimizer.h"
#include "repair_team_manager.h"

using namespace std;
using json = nlohmann::json;

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
    faultManager.loadFaultsFromFile();

    cout << "\n--- Fault Detection ---" << endl;
    
    // fault 1 details
    int faultID1 = 1;
    string location1 = "Substation B";
    double voltage1 = 185;
    double load1 = 80;
    double latitude1 = 30.3165;
    double longitude1 = 78.0322;

    // fault 2 details
    int faultID2 = 2;
    string location2 = "Substation C";
    double voltage2 = 220;
    double load2 = 120;
    double latitude2 = 30.3250;
    double longitude2 = 78.0400;

    // Fault detection
    faultManager.checkFault(faultID1,location1,voltage1,load1,latitude1,longitude1);
    faultManager.checkFault(faultID2,location2,voltage2,load2,latitude2,longitude2);
    faultManager.showFaults();

   
    RepairTeamManager repairManager;
    repairManager.loadTeamsFromFile();

    cout << "\n--- Repair Team Management ---" << endl;
    repairManager.addTeam(RepairTeam(1, "Team Alpha", 30.3200, 78.0300));
    repairManager.addTeam(RepairTeam(2, "Team Beta", 30.3300, 78.0500));
    repairManager.addTeam(RepairTeam(3, "Team Gamma", 30.3100, 78.0200));
    repairManager.showTeams();

    // ASSIGN NEAREST TEAM TO FAULT
    cout << "\n--- Assigning Repair Team ---" << endl;
    repairManager.assignTeam(latitude1, longitude1 );

    // Display updated team status
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

    json outputJson;
    outputJson["totalAllocatedPower"] = manager.totalAllocatedPower_kW;
    outputJson["shortestPathDistance"] = pathResult.totalDistance;
    outputJson["shortestPathNodes"] = pathResult.path;

    ofstream outFile("backend_output.json");
    if (outFile)
    {
        outFile << outputJson.dump(4);
        outFile.close();

        cout << "\nBackend output saved to backend_output.json"
             << endl;
    }
    else
    {
        cout << "\nError opening backend_output.json"
             << endl;
    }

    cout << "\nEco-Grid backend execution completed." << endl;

    return 0;
}
