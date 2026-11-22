#ifndef REPAIR_TEAM_MANAGER_H
#define REPAIR_TEAM_MANAGER_H

#include <iostream>
#include <string>
#include <vector>
#include "route_optimizer.h"

using namespace std;
class RepairTeam
{
public:
    int id;
    string name;
    bool available;
    double latitude;
    double longitude;
    int nodeId;

    RepairTeam();

    RepairTeam(int id , string name , double latitude , double longitude , int nodeId = -1);
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

    int getTeamCount() const;

    DijkstraResult assignTeam(double faultLatitude , double faultLongitude , int faultNodeId , const vector<vector<GraphEdge>>& graph);

    void saveTeamsToFile();
    void loadTeamsFromFile();
};

#endif
