#ifndef ENERGY_LOAD_H
#define ENERGY_LOAD_H

#include <iostream>
#include <queue>
#include <string>
#include <vector>

using namespace std;

enum PriorityLevel { LOW = 1, MEDIUM = 2, HIGH = 3 };

class Consumer {
public:
    string id;
    PriorityLevel priority;
    double powerRequired;
    double powerAllocated;

    Consumer(string id, PriorityLevel priority, double powerRequired);

    bool operator<(const Consumer& other) const;
};

class GridNode {
public:
    double incomingPower;
    double batteryCapacity_kWh;
    double maxBatteryDischargeRate;
    double totalAvailablePower_kW;

    GridNode(double incoming_kW, double capacity_kWh,
             double maxDischarge_kW = 1000.0);
};

class LoadManager {
private:
    priority_queue<Consumer> consumerQueue;
    vector<Consumer> processedConsumers;
    double totalAllocatedPower_kW;

public:
    void addConsumer(const Consumer& c);

    void processGrid(GridNode& grid);
};

#endif