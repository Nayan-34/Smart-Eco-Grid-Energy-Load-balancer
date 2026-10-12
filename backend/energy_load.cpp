
#include "energy_load.h"

Consumer::Consumer()
{
    id = "";
    priority = LOW;
    powerRequired = 0;
    powerAllocated = 0;
}

Consumer::Consumer(string id, PriorityLevel priority, double powerRequired)
{
    this->id = id;
    this->priority = priority;
    this->powerRequired = powerRequired;
    powerAllocated = 0;
}

GridNode::GridNode(double incoming_kW, double capacity_kWh,
                   double maxDischarge_kW)
{
    incomingPower = incoming_kW;
    batteryCapacity_kWh = capacity_kWh;
    maxBatteryDischargeRate = maxDischarge_kW;
    totalAvailablePower_kW = incomingPower + maxBatteryDischargeRate;
}

LoadManager::LoadManager()
{
    count = 0;
    processedCount = 0;
    totalAllocatedPower_kW = 0;
}

void LoadManager::addConsumer(const Consumer& c)
{
    if (count < MAX_CONSUMERS)
    {
        consumers[count] = c;
        count++;
    }
    else
    {
        cout << "Queue is full" << endl;
    }
}

void LoadManager::processGrid(GridNode& grid)
{
    processedCount = 0;
    totalAllocatedPower_kW = 0;

    while (count > 0)
    {
        int highest = 0;

        for (int i = 1; i < count; i++)
        {
            if (consumers[i].priority > consumers[highest].priority)
            {
                highest = i;
            }
        }

        Consumer current = consumers[highest];

        for (int i = highest; i < count - 1; i++)
        {
            consumers[i] = consumers[i + 1];
        }

        count--;

        if (grid.totalAvailablePower_kW >= current.powerRequired)
        {
            current.powerAllocated = current.powerRequired;
        }
        else if (grid.totalAvailablePower_kW > 0)
        {
            current.powerAllocated = grid.totalAvailablePower_kW;
        }
        else
        {
            current.powerAllocated = 0;
        }

        grid.totalAvailablePower_kW -= current.powerAllocated;
        totalAllocatedPower_kW += current.powerAllocated;

        processedConsumers[processedCount] = current;
        processedCount++;
    }
}
