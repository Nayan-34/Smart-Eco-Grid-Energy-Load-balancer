
#include "repair_team_manager.h"
#include <cmath>
#include <cfloat>
#include <fstream>
#include <sstream>

using namespace std;

// Default constructor
RepairTeam::RepairTeam()
{
    id = 0;
    name = "";
    available = true;
    latitude = 0;
    longitude = 0;
    nodeId = -1;
}

// Parameterized constructor
RepairTeam::RepairTeam(int id, string name,
                       double latitude, double longitude,
                       int nodeId)
{
    this->id = id;
    this->name = name;
    this->latitude = latitude;
    this->longitude = longitude;
    this->nodeId = nodeId;
    available = true;
}

// Manager constructor
RepairTeamManager::RepairTeamManager()
{
    teamSize = 0;
    teams = new RepairTeam[5];
}

// Get number of teams
int RepairTeamManager::getTeamCount() const
{
    return teamSize;
}

// Add repair team
void RepairTeamManager::addTeam(RepairTeam team)
{
    if (teamSize < 5)
    {
        teams[teamSize] = team;
        teamSize++;

        cout << "Repair team added successfully." << endl;

        saveTeamsToFile();
    }
    else
    {
        cout << "Maximum number of teams reached." << endl;
    }
}

// Display teams
void RepairTeamManager::showTeams()
{
    cout << "\n--- Repair Teams ---" << endl;

    if (teamSize == 0)
    {
        cout << "No repair teams available." << endl;
        return;
    }

    for (int i = 0; i < teamSize; i++)
    {
        cout << "\nTeam ID   : " << teams[i].id << endl;
        cout << "Name      : " << teams[i].name << endl;
        cout << "Latitude  : " << teams[i].latitude << endl;
        cout << "Longitude : " << teams[i].longitude << endl;
        cout << "Graph Node: N" << teams[i].nodeId << endl;

        cout << "Status    : "
             << (teams[i].available ? "Available" : "Busy")
             << endl;
    }
}

// Select nearest team and calculate shortest route
DijkstraResult RepairTeamManager::assignTeam(
    double faultLatitude,
    double faultLongitude,
    int faultNodeId,
    const vector<vector<GraphEdge>>& graph)
{
    DijkstraResult result = {false, 0, {}, "", -1};
    int selectedTeam = -1;
    double shortestDistance = DBL_MAX;

    // Find nearest available team
    for (int i = 0; i < teamSize; i++)
    {
        if (teams[i].available)
        {
            double latDifference =
                teams[i].latitude - faultLatitude;

            double lonDifference =
                teams[i].longitude - faultLongitude;

            double distance =
                sqrt(latDifference * latDifference +
                     lonDifference * lonDifference);

            cout << "\nDistance of " << teams[i].name
                 << " from fault: " << distance << endl;

            if (distance < shortestDistance)
            {
                shortestDistance = distance;
                selectedTeam = i;
            }
        }
    }

    if (selectedTeam == -1)
    {
        cout << "\nNo repair team available." << endl;
        return result;
    }

    // Validate graph node IDs
    int startNode = teams[selectedTeam].nodeId;

    if (startNode < 0 ||
        startNode >= static_cast<int>(graph.size()) ||
        faultNodeId < 0 ||
        faultNodeId >= static_cast<int>(graph.size()))
    {
        cout << "\nInvalid repair team or fault graph node."
             << endl;
        return result;
    }

    // Calculate shortest route using Dijkstra
    RouteOptimizer route;

    result = route.findShortestPath(
        static_cast<int>(graph.size()),
        graph,
        startNode,
        faultNodeId
    );

    if (!result.success)
    {
        cout << "\nNo route available to the faulty substation."
             << endl;
        return result;
    }

    // Mark selected team as busy only after finding a route
    teams[selectedTeam].available = false;
    saveTeamsToFile();
result.selectedTeamName = teams[selectedTeam].name;
result.selectedTeamId = teams[selectedTeam].id;
    cout << "\n--- Repair Team Assignment ---" << endl;

    cout << "Selected Team   : "
         << teams[selectedTeam].name << endl;

    cout << "Team ID         : "
         << teams[selectedTeam].id << endl;

    cout << "Starting Node   : N"
         << startNode << endl;

    cout << "Fault Node      : N"
         << faultNodeId << endl;

    cout << "Nearest Distance: "
         << shortestDistance << endl;

    cout << "\n--- Optimized Repair Route ---" << endl;

    for (size_t i = 0; i < result.path.size(); i++)
    {
        cout << "N" << result.path[i];

        if (i + 1 < result.path.size())
            cout << " -> ";
    }

    cout << "\nTotal Route Cost: "
         << result.totalDistance << endl;

    cout << "\nRepair team assigned successfully."
         << endl;

    return result;
}

// Save teams
void RepairTeamManager::saveTeamsToFile()
{
    ofstream file("repair_teams.txt");

    if (!file)
    {
        cout << "Error opening repair_teams.txt" << endl;
        return;
    }

    for (int i = 0; i < teamSize; i++)
    {
        file << teams[i].id << "|"
             << teams[i].name << "|"
             << teams[i].available << "|"
             << teams[i].latitude << "|"
             << teams[i].longitude << "|"
             << teams[i].nodeId
             << endl;
    }

    file.close();
}

// Load teams
void RepairTeamManager::loadTeamsFromFile()
{
    ifstream file("repair_teams.txt");

    if (!file)
        return;

    teamSize = 0;

    string line;

    while (getline(file, line) && teamSize < 5)
    {
        stringstream ss(line);

        string id, name, available;
        string latitude, longitude, nodeId;

        getline(ss, id, '|');
        getline(ss, name, '|');
        getline(ss, available, '|');
        getline(ss, latitude, '|');
        getline(ss, longitude, '|');
        getline(ss, nodeId, '|');

        try
        {
            RepairTeam team;

            team.id = stoi(id);
            team.name = name;
            team.available = (stoi(available) != 0);
            team.latitude = stod(latitude);
            team.longitude = stod(longitude);

            // Old records without node IDs need updating
            team.nodeId = nodeId.empty() ? -1 : stoi(nodeId);

            teams[teamSize] = team;
            teamSize++;
        }
        catch (...)
        {
            cout << "Invalid repair team record skipped."
                 << endl;
        }
    }

    file.close();
}
