#include "fault_manager.h"

// Constructor for Fault
Fault::Fault(int id, string location, FaultType type,
             double voltage, double load)
{
    this->id = id;
    this->location = location;
    this->type = type;
    this->voltage = voltage;
    this->load = load;
    active = true;
}


// Check the grid for faults
void FaultManager::checkFault(int id, string location,
                              double voltage, double load)
{
    cout << "\n--- Fault Detection ---" << endl;

    cout << "Location : " << location << endl;
    cout << "Voltage  : " << voltage << " V" << endl;
    cout << "Load     : " << load << " MW" << endl;

    if (voltage < 210)
    {
        Fault fault(id, location, LOW_VOLTAGE,
                    voltage, load);

        faults.push_back(fault);

        cout << "Fault : Low Voltage" << endl;
    }
    else if (load > 100)
    {
        Fault fault(id, location, OVERLOAD,
                    voltage, load);

        faults.push_back(fault);

        cout << "Fault : Overload" << endl;
    }
    else
    {
        cout << "No Fault Detected" << endl;
    }
}


// Display all faults
void FaultManager::showFaults()
{
    cout << "\n--- Fault List ---" << endl;

    if (faults.size() == 0)
    {
        cout << "No faults found." << endl;
        return;
    }

    for (int i = 0; i < faults.size(); i++)
    {
        cout << "\nFault ID : "
             << faults[i].id << endl;

        cout << "Location : "
             << faults[i].location << endl;

        cout << "Voltage  : "
             << faults[i].voltage << " V" << endl;

        cout << "Load     : "
             << faults[i].load << " MW" << endl;

        if (faults[i].active == true)
        {
            cout << "Status   : Active" << endl;
        }
        else
        {
            cout << "Status   : Resolved" << endl;
        }
    }
}


// Resolve a fault
void FaultManager::resolveFault(int faultId)
{
    for (int i = 0; i < faults.size(); i++)
    {
        if (faults[i].id == faultId)
        {
            faults[i].active = false;

            cout << "\nFault "
                 << faultId
                 << " resolved." << endl;

            return;
        }
    }

    cout << "\nFault not found." << endl;
}