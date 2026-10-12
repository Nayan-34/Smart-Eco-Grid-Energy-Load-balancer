
#ifndef ENERGY_LOAD_H
#define ENERGY_LOAD_H

#include <iostream>
#include <string>
using namespace std;

const int MAX_CONSUMERS = 100;

enum PriorityLevel
{
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3
};

class Consumer
{
public:
    string id;
    PriorityLevel priority;
    double powerRequired;
    double powerAllocated;

    Consumer();
    Consumer(string id, PriorityLevel priority, double powerRequired);
};

class GridNode
{
public:
    double incomingPower;
    double batteryCapacity_kWh;
    double maxBatteryDischargeRate;
    double totalAvailablePower_kW;

    GridNode(double incoming_kW, double capacity_kWh,
             double maxDischarge_kW = 1000.0);
};

class LoadManager
{
private:
    Consumer consumers[MAX_CONSUMERS];
    int count;

public:
    Consumer processedConsumers[MAX_CONSUMERS];
    int processedCount;
    double totalAllocatedPower_kW;

    LoadManager();
    void addConsumer(const Consumer& c);
    void processGrid(GridNode& grid);
};

#endif
