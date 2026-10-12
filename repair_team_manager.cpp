#include "repair_team_manager.h"

RepairTeam::RepairTeam(int id, string name)
{
    this->id = id;
    this->name = name;
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
    }
}

void RepairTeamManager::showTeams()
{
    cout << "\n--- Repair Teams ---" << endl;

    for (int i = 0; i < teamSize; i++)
    {
        cout << "Team ID: " << teams[i].id
             << " | Name: " << teams[i].name;

        if (teams[i].available)
            cout << " | Available" << endl;
        else
            cout << " | Busy" << endl;
    }
}

void RepairTeamManager::assignTeam()
{
    for (int i = 0; i < teamSize; i++)
    {
        if (teams[i].available)
        {
            teams[i].available = false;

            cout << "\nTeam " << teams[i].name
                 << " assigned to fault." << endl;

            return;
        }
    }

    cout << "\nNo repair team available." << endl;
}