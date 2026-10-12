
#include <iostream>
#include "energy_load.h"
#include "fault_manager.h"
#include "route_optimizer.h"

using namespace std;

int main()
{
    cout << "Smart Eco-Grid Backend" << endl;
    cout << "----------------------" << endl;

    GridNode grid(500, 1000, 200);
    LoadManager manager;

    manager.addConsumer(Consumer("Hospital", HIGH, 200));
    manager.addConsumer(Consumer("School", MEDIUM, 150));
    manager.addConsumer(Consumer("Office", LOW, 100));
    manager.addConsumer(Consumer("Emergency Center", HIGH, 250));

    manager.processGrid(grid);

    cout << "\nPower Allocation Results\n";

    for (int i = 0; i < manager.processedCount; i++)
    {
        cout << "\nConsumer: "
             << manager.processedConsumers[i].id << endl;

        cout << "Priority: ";

        if (manager.processedConsumers[i].priority == HIGH)
            cout << "High";
        else if (manager.processedConsumers[i].priority == MEDIUM)
            cout << "Medium";
        else
            cout << "Low";

        cout << endl;

        cout << "Power Required: "
             << manager.processedConsumers[i].powerRequired
             << " kW" << endl;

        cout << "Power Allocated: "
             << manager.processedConsumers[i].powerAllocated
             << " kW" << endl;
    }

    cout << "\nTotal Power Allocated: "
         << manager.totalAllocatedPower_kW << " kW" << endl;

    cout << "Remaining Power: "
         << grid.totalAvailablePower_kW << " kW" << endl;

    FaultManager faultManager;

    cout << "\nFault Detection Results\n";

    faultManager.checkFault(1, "Substation B", 185, 80);
    faultManager.checkFault(2, "Substation C", 220, 120);

    faultManager.showFaults();

    cout << "\nRoute Optimization Results\n";

    RouteOptimizer route(4);

    route.addConnection(0, 1, 10);
    route.addConnection(0, 2, 20);
    route.addConnection(1, 3, 5);
    route.addConnection(2, 3, 8);

    route.findShortestRoute(0, 3);

    return 0;
}
