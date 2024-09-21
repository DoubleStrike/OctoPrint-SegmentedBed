/*
 * View model for OctoPrint-SegmentedBed
 *
 * This plugin parses serial terminal messages sent by the Prusa XL to show
 *      temperatures of the individual heatbed tiles for the segmented bed.
 * 
 * Author: DoubleStrike
 * License: AGPLv3
 */
$(function() {
    function SegmentedbedViewModel(parameters) {
        var self = this;
        var classOff = "tileDisabled";
        var classHeat = "tileHeating";
        var classCool = "tileCooling";
        var temperatureTolerance = 0.3;
        var reorderMatrix = [36, 39, 42, 45, 24, 27, 30, 33, 12, 15, 18, 21, 0, 3, 6, 9];
        
        // Data model should contain Name, currentTemp, setTemp
        self.myObservableArray = ko.observableArray(); 
        
        self.fromCurrentData = function (data) {
            if (!data) return;
            if (!data.logs) return;
            
            // Capture current log line
            var newLogData = data.logs[0];
            if (typeof newLogData == 'undefined') return;
            
            // As of firmware 6.1.3+7898 the expected line is in this format (without line wraps obviously):
            /*
            Recv:  T:6.00/0.00 B:22.17/0.00 C:-30.00/0.00 X5:6.00/36.00 A:35.81/0.00 T0:22.00/0.00 T1:25.00/0.00 T2:23.00/0.00 
            T3:24.00/0.00 T4:23.00/0.00 T5:6.00/0.00 @:0 B@:0 HBR@:0 @0:0 @1:0 @2:0 @3:0 @4:0 @5:0 B_0_0:21.80/0.00 B_1_0:21.90/0.00 
            B_2_0:21.90/0.00 B_3_0:22.00/0.00 B_0_1:22.20/0.00 B_1_1:22.20/0.00 B_2_1:22.30/0.00 B_3_1:22.10/0.00 B_0_2:22.20/0.00 
            B_1_2:22.40/0.00 B_2_2:22.40/0.00 B_3_2:22.30/0.00 B_0_3:22.30/0.00 B_1_3:22.20/0.00 B_2_3:22.40/0.00 B_3_3:22.40/0.00
            */
            
            // Get the portion of the line with temperatures
            if (newLogData.search("@5:0") < 10) return;
            var preParseData = newLogData.trim().split("@5:0 ")[1];
            
            // Split on spaces (\s), colons, and slashes - should result in tile_count * 3 array elements (48 for the XL)
            var splitArray = preParseData.split(/[\s\:\/]+/);
            if (splitArray.length < 48) return;

            // Increment thru ever 3rd entry since there are 3 datapoints per tile (name, currentTemp, targetTemp)
            //      in that order. So we shorthand this by lopping thru every 3 items and offsetting the indices.
            //      This is how we fill the dictionary.
            var dictionaryOfTemps = {};
            self.myObservableArray.removeAll();
            
            // Build the array of information to use for the next step
            for (i = 0; i < splitArray.length; i += 3) {
                let x = splitArray[i].substring(2, 3);
                let y = splitArray[i].substring(4, 5);
                let id = (3 - Number(y)) * 4 + Number(x) + 1;
                dictionaryOfTemps[splitArray[i]] = { Current: splitArray[i + 1], Target: splitArray[i + 2], ID: id };
            }

            // TODO: There has GOT to be a better way to do this sorting.
            // Finally, remap the tile order to be correct and add to the ObservableArray
            for (j = 0; j < reorderMatrix.length; j++) {
                let tileName = splitArray[reorderMatrix[j]];
                let currentTemp = splitArray[reorderMatrix[j] + 1];
                let targetTemp = splitArray[reorderMatrix[j] + 2];
                let newStyle = "";
                if (targetTemp == "0.00") {
                    newStyle = classOff;
                } else if(Number(currentTemp) == Number(targetTemp)) {
                    newStyle = "";
                } else {
                    newStyle = (Number(currentTemp) < Number(targetTemp)) ? classHeat : classCool;
                }
                self.myObservableArray.push({ Tile: tileName, Current: currentTemp, Target: targetTemp, Style: newStyle, ID: self.myObservableArray().length });
            }
        }
    }

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: SegmentedbedViewModel,

        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [ "terminalViewModel" ],
        
        // Elements to bind to, e.g. #settings_plugin_segmentedbed, #tab_plugin_segmentedbed, ...
        elements: [ "#tab_plugin_segmentedbed" ]
    });
});
