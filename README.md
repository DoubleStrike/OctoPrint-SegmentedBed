# OctoPrint-SegmentedBed

A plugin to display individual segmented bed temps in real-time for Prusa XL printers.

![SegBed1](https://github.com/user-attachments/assets/6bb04314-4757-43cd-8cd4-a1732a97ff85)

Tiles are shown in one of 4 colors:
| Color       | Meaning      | Description                                                                                                              |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Silver/grey | Inactive     | The tile is disabled. <br/> *This means it is not part of the active print area that was defined by the `M555` command.* |
| Transparent | Temp Reached | The tile is active and has reached the target temperature. <br/> *The background color of the page will show through.*   |
| Red         | Heating      | The tile is below the target temperature and is heating up.                                                              |
| Blue        | Cooling      | The tile is above the target temperature and is cooling down.                                                            |

&nbsp;

&nbsp;

It also plays nicely with UICustomizer and dark themes:
![SegBed UICust](https://github.com/user-attachments/assets/32d3f6af-1d2e-49f4-acd5-21825cecc697)



## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/DoubleStrike/OctoPrint-SegmentedBed/archive/master.zip

## Configuration

None at the moment. Hope to add color coding options and allow selection of number of tiles to allow use of MK4 or other future printers.

## To-Do

* Add configurable color options
* Add a configurable tolerance value used in the "temp reached" calculation, such that being within x.x degrees of the target value is considered "good enough"
* Add better heatmapping with a color gradient from cool to neutral to hot
