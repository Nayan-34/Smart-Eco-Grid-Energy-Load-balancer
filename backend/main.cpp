#include <iostream>
#include "energy_load.h"
#include "fault_manager.h"
#include "route_optimizer.h"
using namespace std;

int main()
{
    cout << "Smart Eco-Grid Backend" << endl;

    GridNode grid(500, 1000);

    LoadManager manager;

    manager.addConsumer(
        Consumer("Hospital", HIGH, 200)
    );

    manager.addConsumer(
        Consumer("School", MEDIUM, 150)
    );

    manager.addConsumer(
        Consumer("Office", LOW, 100)
    );

    manager.processGrid(grid);


    
    FaultManager faultManager;

    faultManager.checkFault(
        1, "Substation B", 185, 80
    );

    faultManager.checkFault(
        2, "Substation C", 220, 120
    );

    faultManager.showFaults();
    
     RouteOptimizer route(4);

    route.addConnection(0, 1, 10);
    route.addConnection(0, 2, 20);
    route.addConnection(1, 3, 5);
    route.addConnection(2, 3, 8);

    route.findShortestRoute(0, 3);

    return 0;
    
}