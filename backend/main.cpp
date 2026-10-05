#include <iostream>
#include "energy_load.h"

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

    return 0;
}