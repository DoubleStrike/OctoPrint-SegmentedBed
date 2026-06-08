# OctoPrint-SegmentedBed

A plugin to display individual segmented bed temps in real-time for Prusa XL printers.

As of version 2.0.0, the colors are now configurable via a settings page, and the tiles now show a variable-color heatmap increasing in intensity the hotter 
or colder a tile is versus the target temperature. Font colors are dynamically set based on tile color to increase readability.

**Note that as of 2.0.0, the color scheme has changed based on user feedback.** Instead of showing red for heating and blue for cooling, the gradient heatmap now
shows blue=cold and red=hot. This way, the heatmap tracks more closely with a normal thermometer, and not with the tiles' cooling behavior. The maximum variation 
is 10 degrees C. Any tile farther from the target than that will show maximum hot or cold color.

It also plays nicely with UICustomizer and dark themes. The legend at the top will show the minimum and maximum temps of all active tiles, as well as the
minimum and maximum deltas from the target temperature.


<img width="784" height="787" alt="Segbed Screenshot 2026-06-07 221800" src="https://github.com/user-attachments/assets/d0e6e0ce-a6d6-4202-b29e-7c6f78cf9a15" />



Tiles are shown in one of 4 states:
| Color       | Meaning      | Description                                                                                                              |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Silver/grey | Inactive     | The tile is disabled. <br/> *This means it is not part of the active print area that was defined by the `M555` command.* |
| Transparent | Temp Reached | The tile is active and has reached the target temperature. <br/> *The background color of the page will show through.*   |
| Red         | Above Target | The tile is above the target temperature and is cooling down. Brighter color indicates bigger gap to target temperature. |
| Blue        | Below Target | The tile is below the target temperature and is heating up. Brighter color indicates bigger gap to target temperature.   |



## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/DoubleStrike/OctoPrint-SegmentedBed/archive/master.zip

## Configuration

The colors used for hot and cold can be configured in the settings page. This page also shows a live preview of the Hot/Neutral/Cold colors to let you see how they will interact with your theme in real-time.

## To-Do

* Add a configurable tolerance value used in the "temp reached" calculation, such that being within x.x degrees of the target value is considered "good enough"

## License and Copying
* License: AGPLv3 - all derivative work must be AGPLv3 compliant!
