#include "repair_team_manager.h"
#include "route_optimizer.h"
#include <cmath>
#include <cfloat>

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

