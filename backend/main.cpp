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

    cout << "\n--- Fault Detection ---" << endl;
    
    // fault details
    int faultID1 = 1;
    string location1 = "Substation B";
    double voltage1 = 185;
    double load1 = 80;

    int faultID2 = 2;
    string location2 = "Substation C";
    double voltage2 = 220;
    double load2 = 120;

     // Fault detection
    faultManager.checkFault(
        faultID1,
        location1,
        voltage1,
        load1
    );

    faultManager.checkFault(
        faultID2,
        location2,
        voltage2,
        load2
    );
    faultManager.showFaults();

    // ================= FILE HANDLING =================

    ofstream faultFile("faults.txt", ios::app);

    if (faultFile)
    {
        faultFile << "SMART ECO-GRID FAULT RECORD" << endl;
        faultFile << "-----------------------------" << endl;

        faultFile << "Fault ID : " << faultID1 << endl;
        faultFile << "Location : " << location1 << endl;
        faultFile << "Voltage  : " << voltage1 << " V" << endl;
        faultFile << "Load     : " << load1 << " MW" << endl;

        if (voltage1 < 210)
        {
            faultFile << "Fault    : Low Voltage" << endl;

            if (voltage1 < 190)
                faultFile << "Severity : High" << endl;
            else
                faultFile << "Severity : Medium" << endl;
        }

        faultFile << "Status   : Active" << endl;
        faultFile << "-----------------------------" << endl;

        faultFile << "Fault ID : " << faultID2 << endl;
        faultFile << "Location : " << location2 << endl;
        faultFile << "Voltage  : " << voltage2 << " V" << endl;
        faultFile << "Load     : " << load2 << " MW" << endl;

        if (voltage2 < 210)
        {
            faultFile << "Fault    : Low Voltage" << endl;

            if (voltage2 < 190)
                faultFile << "Severity : High" << endl;
            else
                faultFile << "Severity : Medium" << endl;
        }
        else if (load2 > 100)
        {
            faultFile << "Fault    : Overload" << endl;

            if (load2 > 150)
                faultFile << "Severity : High" << endl;
            else
                faultFile << "Severity : Medium" << endl;
        }

        faultFile << "Status   : Active" << endl;
        faultFile << "-----------------------------" << endl;

        faultFile.close();

        cout << "\nFault data saved to faults.txt" << endl;
    }
    else
    {
        cout << "\nError opening faults.txt" << endl;
    }

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

    json outputJson;
    outputJson["totalAllocatedPower"] = manager.totalAllocatedPower_kW;
    outputJson["shortestPathDistance"] = pathResult.totalDistance;
    outputJson["shortestPathNodes"] = pathResult.path;

    ofstream outFile("backend_output.json");
    outFile << outputJson.dump(4);
    outFile.close();

    cout << "\nEco-Grid backend execution completed." << endl;

    return 0;
}
