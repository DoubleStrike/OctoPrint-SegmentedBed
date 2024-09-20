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
            
            // Parse the line and split off the initial characters ("Recv:  ")
            var cleanedLogData = newLogData.trim().substring(7);
            
            // Split out the string and capture heatbed tiles
            var splitLogData = cleanedLogData.split(" ");
            if (splitLogData.length < 36) return;
            var tile_0_0 = splitLogData[20].split(":")[1];
            var tile_1_0 = splitLogData[21].split(":")[1];
            var tile_2_0 = splitLogData[22].split(":")[1];
            var tile_3_0 = splitLogData[23].split(":")[1];
            
            var tile_0_1 = splitLogData[24].split(":")[1];
            var tile_1_1 = splitLogData[25].split(":")[1];
            var tile_2_1 = splitLogData[26].split(":")[1];
            var tile_3_1 = splitLogData[27].split(":")[1];
            
            var tile_0_2 = splitLogData[28].split(":")[1];
            var tile_1_2 = splitLogData[29].split(":")[1];
            var tile_2_2 = splitLogData[30].split(":")[1];
            var tile_3_2 = splitLogData[31].split(":")[1];
            
            var tile_0_3 = splitLogData[32].split(":")[1];
            var tile_1_3 = splitLogData[33].split(":")[1];
            var tile_2_3 = splitLogData[34].split(":")[1];
            var tile_3_3 = splitLogData[35].split(":")[1];
            
            // Update the HTML text databound properties
            self.cell0_0(tile_0_0);
            self.cell1_0(tile_1_0);
            self.cell2_0(tile_2_0);
            self.cell3_0(tile_3_0);
            
            self.cell0_1(tile_0_1);
            self.cell1_1(tile_1_1);
            self.cell2_1(tile_2_1);
            self.cell3_1(tile_3_1);
            
            self.cell0_2(tile_0_2);
            self.cell1_2(tile_1_2);
            self.cell2_2(tile_2_2);
            self.cell3_2(tile_3_2);
            
            self.cell0_3(tile_0_3);
            self.cell1_3(tile_1_3);
            self.cell2_3(tile_2_3);
            self.cell3_3(tile_3_3);

            // Update the CSS style databound properties
            if (tile_0_0.split("/")[1] == "0.00") self.cell0_0class("tileDisabled"); else {
                if (tile_0_0.split("/")[0] < tile_0_0.split("/")[1]) self.cell0_0class("tileHeating");
                else self.cell0_0class("tileCooling");
            }
            if (tile_1_0.split("/")[1] == "0.00") self.cell1_0class("tileDisabled"); else {
                if (tile_1_0.split("/")[0] < tile_1_0.split("/")[1]) self.cell1_0class("tileHeating");
                else self.cell1_0class("tileCooling");
            }
            if (tile_2_0.split("/")[1] == "0.00") self.cell2_0class("tileDisabled"); else {
                if (tile_2_0.split("/")[0] < tile_2_0.split("/")[1]) self.cell2_0class("tileHeating");
                else self.cell2_0class("tileCooling");
            }
            if (tile_3_0.split("/")[1] == "0.00") self.cell3_0class("tileDisabled"); else {
                if (tile_3_0.split("/")[0] < tile_3_0.split("/")[1]) self.cell3_0class("tileHeating");
                else self.cell3_0class("tileCooling");
            }
            
            if (tile_0_1.split("/")[1] == "0.00") self.cell0_1class("tileDisabled"); else {
                if (tile_0_1.split("/")[0] < tile_0_1.split("/")[1]) self.cell0_1class("tileHeating");
                else self.cell0_1class("tileCooling");
            }
            if (tile_1_1.split("/")[1] == "0.00") self.cell1_1class("tileDisabled"); else {
                if (tile_1_1.split("/")[0] < tile_1_1.split("/")[1]) self.cell1_1class("tileHeating");
                else self.cell1_1class("tileCooling");
            }
            if (tile_2_1.split("/")[1] == "0.00") self.cell2_1class("tileDisabled"); else {
                if (tile_2_1.split("/")[0] < tile_2_1.split("/")[1]) self.cell2_1class("tileHeating");
                else self.cell2_1class("tileCooling");
            }
            if (tile_3_1.split("/")[1] == "0.00") self.cell3_1class("tileDisabled"); else {
                if (tile_3_1.split("/")[0] < tile_3_1.split("/")[1]) self.cell3_1class("tileHeating");
                else self.cell3_1class("tileCooling");
            }
            
            if (tile_0_2.split("/")[1] == "0.00") self.cell0_2class("tileDisabled"); else {
                if (tile_0_2.split("/")[0] < tile_0_2.split("/")[1]) self.cell0_2class("tileHeating");
                else self.cell0_2class("tileCooling");
            }
            if (tile_1_2.split("/")[1] == "0.00") self.cell1_2class("tileDisabled"); else {
                if (tile_1_2.split("/")[0] < tile_1_2.split("/")[1]) self.cell1_2class("tileHeating");
                else self.cell1_2class("tileCooling");
            }
            if (tile_2_2.split("/")[1] == "0.00") self.cell2_2class("tileDisabled"); else {
                if (tile_2_2.split("/")[0] < tile_2_2.split("/")[1]) self.cell2_2class("tileHeating");
                else self.cell2_2class("tileCooling");
            }
            if (tile_3_2.split("/")[1] == "0.00") self.cell3_2class("tileDisabled"); else {
                if (tile_3_2.split("/")[0] < tile_3_2.split("/")[1]) self.cell3_2class("tileHeating");
                else self.cell3_2class("tileCooling");
            }
            
            if (tile_0_3.split("/")[1] == "0.00") self.cell0_3class("tileDisabled"); else {
                if (tile_0_3.split("/")[0] < tile_0_3.split("/")[1]) self.cell0_3class("tileHeating");
                else self.cell0_3class("tileCooling");
            }
            if (tile_1_3.split("/")[1] == "0.00") self.cell1_3class("tileDisabled"); else {
                if (tile_1_3.split("/")[0] < tile_1_3.split("/")[1]) self.cell1_3class("tileHeating");
                else self.cell1_3class("tileCooling");
            }
            if (tile_2_3.split("/")[1] == "0.00") self.cell2_3class("tileDisabled"); else {
                if (tile_2_3.split("/")[0] < tile_2_3.split("/")[1]) self.cell2_3class("tileHeating");
                else self.cell2_3class("tileCooling");
            }
            if (tile_3_3.split("/")[1] == "0.00") self.cell3_3class("tileDisabled"); else {
                if (tile_3_3.split("/")[0] < tile_3_3.split("/")[1]) self.cell3_3class("tileHeating");
                else self.cell3_3class("tileCooling");
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
