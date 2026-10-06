#ifndef FAULT_MANAGER_H
#define FAULT_MANAGER_H

#include <iostream>
#include <string>
#include <vector>

using namespace std;

enum FaultType
{
    NO_FAULT,
    LOW_VOLTAGE,
    OVERLOAD
};

class Fault
{
public:
    int id;
    string location;
    FaultType type;
    double voltage;
    double load;
    bool active;

    Fault(int id, string location, FaultType type,
          double voltage, double load);
};

class FaultManager
{
private:
    vector<Fault> faults;

public:
    void checkFault(int id, string location,
                    double voltage, double load);

    void showFaults();

    void resolveFault(int faultId);
};

#endif