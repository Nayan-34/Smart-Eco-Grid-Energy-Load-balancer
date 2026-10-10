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

    RepairTeam(int id, string name);
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
    void assignTeam();
};

#endif