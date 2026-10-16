#ifndef REPAIR_TEAM_MANAGER_H
#define REPAIR_TEAM_MANAGER_H

#include <iostream>
#include <string>
using namespace std;

class RepairTeam
{
public:
    int id;
    string name;
    bool available;
    double latitude;
    double longitude;

    RepairTeam();

    RepairTeam(int id, string name, double latitude, double longitude);
};

class RepairTeamManager
{
private:
    RepairTeam* teams;
    int teamSize;

public:
    RepairTeamManager();

    void addTeam(RepairTeam team);
    void showTeams();

    // Assign nearest available team
    void assignTeam(double faultLatitude,
                    double faultLongitude);
};

#endif
