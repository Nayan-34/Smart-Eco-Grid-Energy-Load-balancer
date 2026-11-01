#include "repair_team_manager.h"
#include "route_optimizer.h"
#include <cmath>
#include <cfloat>
#include <fstream>
#include <sstream>

using namespace std;

RepairTeam::RepairTeam()
{
    id = 0;
    name = "";
    available = true;
    latitude = 0;
    longitude = 0;
}


RepairTeam::RepairTeam(int id, string name,
                       double latitude, double longitude)
{
    this->id = id;
    this->name = name;
    this->latitude = latitude;
    this->longitude = longitude;
    available = true;
}

RepairTeamManager::RepairTeamManager()
{
    teamSize = 0;
    teams = new RepairTeam[5];
}

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

        if (teams[i].available)
            cout << " | Available" << endl;
        else
            cout << " | Busy" << endl;
    }
}

void RepairTeamManager::assignTeam(double faultLatitude,
                                  double faultLongitud)
{
    int selectedTeam = -1;
    double shortestDistance = DBL_MAX;

    // Find the nearest available repair team
    for (int i = 0; i < teamSize; i++)
    {
        if (teams[i].available)
        {
            double latDifference =
                teams[i].latitude - faultLatitude;

            double lonDifference =
                teams[i].longitude - faultLongitude;

            // Calculate approximate distance
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
    // Check if any team is available
    if (selectedTeam == -1)
    {
        cout << "\nNo repair team available." << endl;
        return;
    }
    // Mark selected team as busy
    teams[selectedTeam].available = false;
    saveTeamsToFile();
    
    cout << "\n--- Team Assignment ---" << endl;

    cout << "Selected Team   : "
         << teams[selectedTeam].name << endl;

    cout << "Team ID         : "
         << teams[selectedTeam].id << endl;

    cout << "Team Latitude   : "
         << teams[selectedTeam].latitude << endl;

    cout << "Team Longitude  : "
         << teams[selectedTeam].longitude << endl;

    cout << "Fault Latitude  : "
         << faultLatitude << endl;

    cout << "Fault Longitude : "
         << faultLongitude << endl;

    cout << "Nearest Distance: "
         << shortestDistance << endl;

    // Pass team and fault coordinates to RouteOptimizer
    RouteOptimizer route;

    route.findShortestRoute(
        teams[selectedTeam].latitude,
        teams[selectedTeam].longitude,
        faultLatitude,
        faultLongitude
    );
}
// Save Repair Teams to File
void RepairTeamManager::saveTeamsToFile()
{
    ofstream file("repair_teams.txt");

    if (!file)
    {
        cout << "\nError: Unable to open repair_teams.txt"
             << endl;
        return;
    }

    for (int i = 0; i < teamSize; i++)
    {
        file << teams[i].id << "|"
             << teams[i].name << "|"
             << teams[i].available << "|"
             << teams[i].latitude << "|"
             << teams[i].longitude
             << endl;
    }

    file.close();
}


// Load Repair Teams from File
void RepairTeamManager::loadTeamsFromFile()
{
    ifstream file("repair_teams.txt");

    if (!file)
    {
        // File does not exist yet
        return;
    }

    teamSize = 0;

    string line;

    while (getline(file, line) && teamSize < 5)
    {
        stringstream ss(line);

        string id;
        string name;
        string available;
        string latitude;
        string longitude;

        getline(ss, id, '|');
        getline(ss, name, '|');
        getline(ss, available, '|');
        getline(ss, latitude, '|');
        getline(ss, longitude, '|');

        teams[teamSize].id = stoi(id);
        teams[teamSize].name = name;
        teams[teamSize].available = stoi(available);
        teams[teamSize].latitude = stod(latitude);
        teams[teamSize].longitude = stod(longitude);

        teamSize++;
    }

    file.close();
}
