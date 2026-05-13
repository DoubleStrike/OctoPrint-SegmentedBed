# OctoPrint-SegmentedBed

A plugin to display individual segmented bed temps in real-time for Prusa XL printers.

As of version 2.0.0, the colors are now configurable via a settings page, and the tiles now show a variable-color heatmap increasing in intensity the hotter 
or colder a tile is versus the target temperature. Font colors are dynamically set based on tile color to increase readability.

**Note that as of 2.0.0, the color scheme has changed based on user feedback.** Instead of showing red for heating and blue for cooling, the gradient heatmap now
shows blue=cold and red=hot. This way, the heatmap tracks more closely with the heat state of the bed, and not with the cooling behavior. The maximum variation 
is 10 degrees C. Any tile farther from the target than that will show maximum hot or cold color.


![SegBed1](https://github.com/user-attachments/assets/6bb04314-4757-43cd-8cd4-a1732a97ff85)

Tiles are shown in one of 4 states:
| Color       | Meaning      | Description                                                                                                              |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Silver/grey | Inactive     | The tile is disabled. <br/> *This means it is not part of the active print area that was defined by the `M555` command.* |
| Transparent | Temp Reached | The tile is active and has reached the target temperature. <br/> *The background color of the page will show through.*   |
| Red         | Above Target | The tile is above the target temperature and is cooling down. Brighter color indicates bigger gap to target temperature. |
| Blue        | Below Target | The tile is below the target temperature and is heating up. Brighter color indicates bigger gap to target temperature.   |

&nbsp;

&nbsp;

It also plays nicely with UICustomizer and dark themes:
![SegBed UICust](https://github.com/user-attachments/assets/32d3f6af-1d2e-49f4-acd5-21825cecc697)



## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/DoubleStrike/OctoPrint-SegmentedBed/archive/master.zip

## Configuration

The colors used for hot and cold

## To-Do

* Add a configurable tolerance value used in the "temp reached" calculation, such that being within x.x degrees of the target value is considered "good enough"
