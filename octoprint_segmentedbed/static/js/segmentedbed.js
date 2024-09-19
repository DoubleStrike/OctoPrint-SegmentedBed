/*
 * View model for OctoPrint-SegmentedBed
 *
 * Author: DoubleStrike
 * License: AGPLv3
 */
$(function() {
    function SegmentedbedViewModel(parameters) {
        var self = this;
        var debug_limitSpam = 0;

        self.testdatabind = ko.observable("nothing yet");

        // assign the injected parameters, e.g.:
        // self.loginStateViewModel = parameters[0];
        // self.settingsViewModel = parameters[1];

        self.fromCurrentData = function (data) {
            if (!data) return;
            if (!data.logs) return;

            // Capture current log line
            var newLogData = data.logs[0];
            if (typeof newLogData == 'undefined') return;

            // Parse the line and split off the initial characters
            var cleanedLogData = newLogData.trim().substring(7);

            // Split out the string and capture heatbed tiles
            var splitLogData = cleanedLogData.split(" ");
            if (splitLogData.length < 37) return;
            var tile_0_0 = splitLogData[21].split(":")[1];
            var tile_1_0 = splitLogData[22].split(":")[1];
            var tile_2_0 = splitLogData[23].split(":")[1];
            var tile_3_0 = splitLogData[24].split(":")[1];
            var tile_0_1 = splitLogData[25].split(":")[1];
            var tile_1_1 = splitLogData[26].split(":")[1];
            var tile_2_1 = splitLogData[27].split(":")[1];
            var tile_3_1 = splitLogData[28].split(":")[1];
            var tile_0_2 = splitLogData[29].split(":")[1];
            var tile_1_2 = splitLogData[30].split(":")[1];
            var tile_2_2 = splitLogData[31].split(":")[1];
            var tile_3_2 = splitLogData[32].split(":")[1];
            var tile_0_3 = splitLogData[33].split(":")[1];
            var tile_1_3 = splitLogData[34].split(":")[1];
            var tile_2_3 = splitLogData[35].split(":")[1];
            var tile_3_3 = splitLogData[36].split(":")[1];

            // DEBUG: Alert the info up to 5 times
            if ((debug_limitSpam++) < 5) {
                alert("tile_0_0=" + tile_0_0);
            }

            self.testdatabind(tile_0_0);
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
