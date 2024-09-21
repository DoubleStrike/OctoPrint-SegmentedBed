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
        var alertOnce = false;
        
        // Data model should contain Name, row?, column?, currentTemp, setTemp
        
        // These are the observables for databinding to the HTML cell contents ----------
        self.cell0_0 = ko.observable();
        self.cell1_0 = ko.observable();
        self.cell2_0 = ko.observable();
        self.cell3_0 = ko.observable();
        
        self.cell0_1 = ko.observable();
        self.cell1_1 = ko.observable();
        self.cell2_1 = ko.observable();
        self.cell3_1 = ko.observable();
        
        self.cell0_2 = ko.observable();
        self.cell1_2 = ko.observable();
        self.cell2_2 = ko.observable();
        self.cell3_2 = ko.observable();
        
        self.cell0_3 = ko.observable();
        self.cell1_3 = ko.observable();
        self.cell2_3 = ko.observable();
        self.cell3_3 = ko.observable();
        // ------------------------------------------------------------------------------
        
        // These are the observables for databinding to the CSS class -------------------
        self.cell0_0class = ko.observable();
        self.cell1_0class = ko.observable();
        self.cell2_0class = ko.observable();
        self.cell3_0class = ko.observable();
        
        self.cell0_1class = ko.observable();
        self.cell1_1class = ko.observable();
        self.cell2_1class = ko.observable();
        self.cell3_1class = ko.observable();
        
        self.cell0_2class = ko.observable();
        self.cell1_2class = ko.observable();
        self.cell2_2class = ko.observable();
        self.cell3_2class = ko.observable();
        
        self.cell0_3class = ko.observable();
        self.cell1_3class = ko.observable();
        self.cell2_3class = ko.observable();
        self.cell3_3class = ko.observable();
        // ------------------------------------------------------------------------------

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
            var preParseData = newLogData.trim().split("@5:0 ")[1];
            
            // Split on spaces (\s), colons, and slashes - should result in tile_count * 3 array elements (48 for the XL)
            var splitArray = preParseData.split(/[\s\:\/]+/);
            if (splitArray.length < 48) return;

            // Increment thru ever 3rd entry since there are 3 datapoints per tile (name, currentTemp, targetTemp)
            //      in that order. So we shorthand this by lopping thru every 3 items and offsetting the indices.
            //      This is how we fill the dictionary.
            var dictionaryOfTemps = {};
            
            for (i = 0; i < splitArray.length; i += 3) {
                dictionaryOfTemps[splitArray[i]] = { Current: splitArray[i + 1], Target: splitArray[i + 2] };
            }
            
            // Update the HTML text databound properties
            self.cell0_0(dictionaryOfTemps["B_0_0"].Current + "/" + dictionaryOfTemps["B_0_0"].Target);
            self.cell1_0(dictionaryOfTemps["B_1_0"].Current + "/" + dictionaryOfTemps["B_1_0"].Target);
            self.cell2_0(dictionaryOfTemps["B_2_0"].Current + "/" + dictionaryOfTemps["B_2_0"].Target);
            self.cell3_0(dictionaryOfTemps["B_3_0"].Current + "/" + dictionaryOfTemps["B_3_0"].Target);
            
            self.cell0_1(dictionaryOfTemps["B_0_1"].Current + "/" + dictionaryOfTemps["B_0_1"].Target);
            self.cell1_1(dictionaryOfTemps["B_1_1"].Current + "/" + dictionaryOfTemps["B_1_1"].Target);
            self.cell2_1(dictionaryOfTemps["B_2_1"].Current + "/" + dictionaryOfTemps["B_2_1"].Target);
            self.cell3_1(dictionaryOfTemps["B_3_1"].Current + "/" + dictionaryOfTemps["B_3_1"].Target);
            
            self.cell0_2(dictionaryOfTemps["B_0_2"].Current + "/" + dictionaryOfTemps["B_0_2"].Target);
            self.cell1_2(dictionaryOfTemps["B_1_2"].Current + "/" + dictionaryOfTemps["B_1_2"].Target);
            self.cell2_2(dictionaryOfTemps["B_2_2"].Current + "/" + dictionaryOfTemps["B_2_2"].Target);
            self.cell3_2(dictionaryOfTemps["B_3_2"].Current + "/" + dictionaryOfTemps["B_3_2"].Target);
            
            self.cell0_3(dictionaryOfTemps["B_0_3"].Current + "/" + dictionaryOfTemps["B_0_3"].Target);
            self.cell1_3(dictionaryOfTemps["B_1_3"].Current + "/" + dictionaryOfTemps["B_1_3"].Target);
            self.cell2_3(dictionaryOfTemps["B_2_3"].Current + "/" + dictionaryOfTemps["B_2_3"].Target);
            self.cell3_3(dictionaryOfTemps["B_3_3"].Current + "/" + dictionaryOfTemps["B_3_3"].Target);

            // Update the CSS style databound properties
            if (dictionaryOfTemps["B_0_0"].Target == "0.00") self.cell0_0class(classOff); else { if (dictionaryOfTemps["B_0_0"].Current < dictionaryOfTemps["B_0_0"].Target) self.cell0_0class(classHeat); else self.cell0_0class(classCool); }
            if (dictionaryOfTemps["B_1_0"].Target == "0.00") self.cell1_0class(classOff); else { if (dictionaryOfTemps["B_1_0"].Current < dictionaryOfTemps["B_1_0"].Target) self.cell1_0class(classHeat); else self.cell1_0class(classCool); }
            if (dictionaryOfTemps["B_2_0"].Target == "0.00") self.cell2_0class(classOff); else { if (dictionaryOfTemps["B_2_0"].Current < dictionaryOfTemps["B_2_0"].Target) self.cell2_0class(classHeat); else self.cell2_0class(classCool); }
            if (dictionaryOfTemps["B_3_0"].Target == "0.00") self.cell3_0class(classOff); else { if (dictionaryOfTemps["B_3_0"].Current < dictionaryOfTemps["B_3_0"].Target) self.cell3_0class(classHeat); else self.cell3_0class(classCool); }

            if (dictionaryOfTemps["B_0_1"].Target == "0.00") self.cell0_1class(classOff); else { if (dictionaryOfTemps["B_0_1"].Current < dictionaryOfTemps["B_0_1"].Target) self.cell0_1class(classHeat); else self.cell0_1class(classCool); }
            if (dictionaryOfTemps["B_1_1"].Target == "0.00") self.cell1_1class(classOff); else { if (dictionaryOfTemps["B_1_1"].Current < dictionaryOfTemps["B_1_1"].Target) self.cell1_1class(classHeat); else self.cell1_1class(classCool); }
            if (dictionaryOfTemps["B_2_1"].Target == "0.00") self.cell2_1class(classOff); else { if (dictionaryOfTemps["B_2_1"].Current < dictionaryOfTemps["B_2_1"].Target) self.cell2_1class(classHeat); else self.cell2_1class(classCool); }
            if (dictionaryOfTemps["B_3_1"].Target == "0.00") self.cell3_1class(classOff); else { if (dictionaryOfTemps["B_3_1"].Current < dictionaryOfTemps["B_3_1"].Target) self.cell3_1class(classHeat); else self.cell3_1class(classCool); }

            if (dictionaryOfTemps["B_0_2"].Target == "0.00") self.cell0_2class(classOff); else { if (dictionaryOfTemps["B_0_2"].Current < dictionaryOfTemps["B_0_2"].Target) self.cell0_2class(classHeat); else self.cell0_2class(classCool); }
            if (dictionaryOfTemps["B_1_2"].Target == "0.00") self.cell1_2class(classOff); else { if (dictionaryOfTemps["B_1_2"].Current < dictionaryOfTemps["B_1_2"].Target) self.cell1_2class(classHeat); else self.cell1_2class(classCool); }
            if (dictionaryOfTemps["B_2_2"].Target == "0.00") self.cell2_2class(classOff); else { if (dictionaryOfTemps["B_2_2"].Current < dictionaryOfTemps["B_2_2"].Target) self.cell2_2class(classHeat); else self.cell2_2class(classCool); }
            if (dictionaryOfTemps["B_3_2"].Target == "0.00") self.cell3_2class(classOff); else { if (dictionaryOfTemps["B_3_2"].Current < dictionaryOfTemps["B_3_2"].Target) self.cell3_2class(classHeat); else self.cell3_2class(classCool); }

            if (dictionaryOfTemps["B_0_3"].Target == "0.00") self.cell0_3class(classOff); else { if (dictionaryOfTemps["B_0_3"].Current < dictionaryOfTemps["B_0_3"].Target) self.cell0_3class(classHeat); else self.cell0_3class(classCool); }
            if (dictionaryOfTemps["B_1_3"].Target == "0.00") self.cell1_3class(classOff); else { if (dictionaryOfTemps["B_1_3"].Current < dictionaryOfTemps["B_1_3"].Target) self.cell1_3class(classHeat); else self.cell1_3class(classCool); }
            if (dictionaryOfTemps["B_2_3"].Target == "0.00") self.cell2_3class(classOff); else { if (dictionaryOfTemps["B_2_3"].Current < dictionaryOfTemps["B_2_3"].Target) self.cell2_3class(classHeat); else self.cell2_3class(classCool); }
            if (dictionaryOfTemps["B_3_3"].Target == "0.00") self.cell3_3class(classOff); else { if (dictionaryOfTemps["B_3_3"].Current < dictionaryOfTemps["B_3_3"].Target) self.cell3_3class(classHeat); else self.cell3_3class(classCool); }
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
