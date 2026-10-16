#include "fault_manager.h"

Fault::Fault(int id, string location, FaultType type,
             double voltage, double load,
             double latitude, double longitude)
{
    this->id = id;
    this->location = location;
    this->type = type;
    this->voltage = voltage;
    this->load = load;
    this->latitude = latitude;
    this->longitude = longitude;

    active = true;
  
    setSeverity();
}

void Fault::setSeverity()
{
    if (type == LOW_VOLTAGE)
    {
        if (voltage < 190)
        {
            severity = "High";
        }
        else
        {
            severity = "Medium";
        }
    }
    else if (type == OVERLOAD)
    {
        if (load > 150)
        {
            severity = "High";
        }
        else
        {
            severity = "Medium";
        }
    }
    else
    {
        severity = "Low";
    }
}

void FaultManager::checkFault(int id, string location,
                              double voltage, double load,
                              double latitude, double longitude)
{
    cout << "\n--- Fault Detection ---" << endl;

    cout << "Location : " << location << endl;
    cout << "Latitude  : " << latitude << endl;
    cout << "Longitude : " << longitude << endl;
    cout << "Voltage  : " << voltage << " V" << endl;
    cout << "Load     : " << load << " MW" << endl;

    if (voltage < 210)
    {
        Fault fault(id, location, LOW_VOLTAGE,
                    voltage, load, latitude, longitude);

        faults.push_back(fault);

        cout << "Fault : Low Voltage" << endl;
    }
    else if (load > 100)
    {
        Fault fault(id, location, OVERLOAD,
                    voltage, load, latitude, longitude);

        faults.push_back(fault);

        cout << "Fault : Overload" << endl;
    }
    else
    {
        cout << "No Fault Detected" << endl;
    }
}

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

        cout << "Latitude : "
             << faults[i].latitude << endl;

        cout << "Longitude: "
             << faults[i].longitude << endl;

        cout << "Voltage  : "
             << faults[i].voltage << " V" << endl;

        cout << "Load     : "
             << faults[i].load << " MW" << endl;

        cout << "Severity : "
             << faults[i].severity << endl;


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
