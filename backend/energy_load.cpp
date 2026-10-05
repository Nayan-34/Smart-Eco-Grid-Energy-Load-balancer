#include "energy_load.h"

// Constructor for Consumer
Consumer::Consumer(string id, PriorityLevel priority, double powerRequired)
{
    this->id = id;
    this->priority = priority;
    this->powerRequired = powerRequired;
    powerAllocated = 0;
}

// Used by priority queue to compare consumers
bool Consumer::operator<(const Consumer& other) const
{
    return priority < other.priority;
}

// Constructor for GridNode
GridNode::GridNode(double incoming_kW, double capacity_kWh,
                   double maxDischarge_kW)
{
    incomingPower = incoming_kW;
    batteryCapacity_kWh = capacity_kWh;
    maxBatteryDischargeRate = maxDischarge_kW;

    totalAvailablePower_kW =
        incomingPower + maxBatteryDischargeRate;
}

// Add consumer to priority queue
void LoadManager::addConsumer(const Consumer& c)
{
    consumerQueue.push(c);
}

// Distribute power according to priority
void LoadManager::processGrid(GridNode& grid)
{
    processedConsumers.clear();
    totalAllocatedPower_kW = 0;

    while (!consumerQueue.empty())
    {
        Consumer current = consumerQueue.top();
        consumerQueue.pop();

        if (grid.totalAvailablePower_kW >= current.powerRequired)
        {
            // Enough power is available
            current.powerAllocated = current.powerRequired;

            grid.totalAvailablePower_kW =
                grid.totalAvailablePower_kW - current.powerRequired;
        }
        else if (grid.totalAvailablePower_kW > 0)
        {
            // Only some power is available
            current.powerAllocated =
                grid.totalAvailablePower_kW;

            grid.totalAvailablePower_kW = 0;
        }
        else
        {
            // No power is available
            current.powerAllocated = 0;
        }

        totalAllocatedPower_kW =
            totalAllocatedPower_kW + current.powerAllocated;

        processedConsumers.push_back(current);
    }
}
