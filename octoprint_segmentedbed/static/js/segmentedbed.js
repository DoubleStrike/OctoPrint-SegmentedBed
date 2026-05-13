/*
 * View model for OctoPrint-SegmentedBed
 *
 * This plugin parses serial terminal messages sent by the Prusa XL to show
 *      temperatures of the individual heatbed tiles for the segmented bed.
 * 
 * Author: DoubleStrike
 * License: AGPLv3
 */
$(function () {
    function SegmentedbedViewModel(parameters) {
        var self = this;
        var classOff = "tileDisabled";
        var classHeat = "tileHeating";
        var classCool = "tileCooling";
        var reorderMatrix = [36, 39, 42, 45, 24, 27, 30, 33, 12, 15, 18, 21, 0, 3, 6, 9];

        self.settings = parameters[0]; // terminalViewModel
        self.settings = parameters[1]; // settingsViewModel

        // Grab the current colors from the theme (if applicable)
        const themeColors = {
            neutral: getComputedStyle(document.body).backgroundColor ||
                getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim() || "#222222",
            hot: getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#ff4444",
            cold: getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "#4488ff"
        };

        const roundToTwo = (num) => Math.round(num * 100) / 100;

        // Helpers to get user-selected or theme colors
        function pluginSettings() {
            try {
                return self.settings.settings.plugins.segmentedbed;
            } catch (e) {
                return null;
            }
        }

        function getHotColor() {
            const ps = pluginSettings();
            if (ps && ps.use_custom_colors && ps.use_custom_colors()) {
                return ps.hot_color();
            }
            return themeColors.hot;
        }

        function getColdColor() {
            const ps = pluginSettings();
            if (ps && ps.use_custom_colors && ps.use_custom_colors()) {
                return ps.cold_color();
            }
            return themeColors.cold;
        }

        // Convert a tile temperature to a blue → white → red gradient
        // Updated to support dynamic scaling
        function tempToColor(current, target, dynamicMaxDelta) {
            const hotBase = getHotColor();
            const coldBase = getColdColor();

            let delta = current - target;
            let absDelta = Math.abs(delta);

            // Normalize using dynamic max delta
            let norm = absDelta / dynamicMaxDelta;
            norm = Math.min(1, norm);

            const opacity = roundToTwo(norm);
            const baseColor = delta < 0 ? coldBase : hotBase;

            const { r, g, b } = parseColor(baseColor);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }

        // Helper: parse hex or rgb(...) → {r,g,b}
        function parseColor(c) {
            c = c.trim();
            if (c.startsWith("rgb")) {
                const [r, g, b] = c.match(/\d+/g).map(Number);
                return { r, g, b };
            }
            c = c.replace("#", "");
            if (c.length === 3) c = c.split("").map(x => x + x).join("");
            const r = parseInt(c.substring(0, 2), 16);
            const g = parseInt(c.substring(2, 4), 16);
            const b = parseInt(c.substring(4, 6), 16);
            return { r, g, b };
        }

        // Compute text color for best contrast against an RGBA background
        function getContrastTextColor(bgColor) {
            // Extract RGBA components
            const parts = bgColor.match(/\d+(\.\d+)?/g).map(Number);
            const [r, g, b, a = 1] = parts;

            // Base luminance of the tile color
            const tileLum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

            // Detect theme
            const isDark = document.body.classList.contains("theme-dark");

            // Compute page background luminance
            const bg = getComputedStyle(document.body).backgroundColor;
            const [br, bgG, bb] = bg.match(/\d+/g).map(Number);
            const pageLum = (0.2126 * br + 0.7152 * bgG + 0.0722 * bb) / 255;

            let effectiveLum;
            let threshold;

            if (isDark) {
                // Dark theme: opacity makes the tile visually darker
                effectiveLum = tileLum * a;
                threshold = 0.35;
            } else {
                // Light theme: tile sits on a bright background
                // Effective luminance is a blend of tile + page background
                effectiveLum = tileLum * a + pageLum * (1 - a);

                // Higher threshold because the page is bright
                threshold = 0.55;
            }

            return effectiveLum > threshold ? "#000000" : "#ffffff";
        }


        // Array data model: ID, Tile, Current, Target, Style
        self.heatbedTileArray = ko.observableArray();

        // Average bed temp
        self.HotEndTemp = ko.observable();

        // Average bed temp
        self.AvgBedTemp = ko.observable();

        self.fromCurrentData = function (data) {
            if (!data) return;
            if (!data.logs) return;
            
            // Capture current log line
            var newLogData = data.logs[0];
            if (typeof newLogData == 'undefined') return;
            
            // As of firmware 6.2.6+8948 the expected line is in this format (without line wraps obviously):
            /*
            Recv:  T:6.00/0.00 B:22.17/0.00 C:-30.00/0.00 X5:6.00/36.00 A:35.81/0.00 T0:22.00/0.00 T1:25.00/0.00 T2:23.00/0.00 
            T3:24.00/0.00 T4:23.00/0.00 T5:6.00/0.00 @:0 B@:0 HBR@:0 @0:0 @1:0 @2:0 @3:0 @4:0 @5:0 B_0_0:21.80/0.00 B_1_0:21.90/0.00 
            B_2_0:21.90/0.00 B_3_0:22.00/0.00 B_0_1:22.20/0.00 B_1_1:22.20/0.00 B_2_1:22.30/0.00 B_3_1:22.10/0.00 B_0_2:22.20/0.00 
            B_1_2:22.40/0.00 B_2_2:22.40/0.00 B_3_2:22.30/0.00 B_0_3:22.30/0.00 B_1_3:22.20/0.00 B_2_3:22.40/0.00 B_3_3:22.40/0.00

            For reference, the T is active tool temperature, B is average bed temp, C is heated chamber temp, @ is heater power,
            HBR@ is heatbreak temp, T0-T5 are the toolhead temps.  Sourced from "lib/Marlin/Marlin/src/module/temperature.cpp"
            */
            
            // Get the portion of the line with temperatures, if the line is valid only
            if (newLogData.search("@5:0") < 10) return;
            var preParseData = newLogData.trim().split("@5:0 ")[1];

            // Grab the hot-end temp reading
            var toolTemp = (newLogData.trim().substring(7).split(" ")[0]).split(":")[1];
            self.HotEndTemp(toolTemp);
            
            // Grab the average bed temp reading
            var avgTemperatureReported = (newLogData.trim().substring(7).split(" ")[1]).split(":")[1];
            self.AvgBedTemp(avgTemperatureReported);
            
            // Split on spaces (\s), colons, and slashes - should result in tile_count * 3 array elements (48 for the XL)
            var splitArray = preParseData.split(/[\s\:\/]+/);
            if (splitArray.length < 48) return;

            // Increment thru every 3rd entry since there are 3 datapoints per tile (name, currentTemp, targetTemp)
            //      in that order. So we shorthand this by looping thru every 3 items and offsetting the indices.
            //      This is how we fill the dictionary.
            var dictionaryOfTemps = {};
            self.heatbedTileArray.removeAll();
            
            // Track maximum observed delta for dynamic scaling
            let maxObservedDelta = 0;

            // The dictionary is used here to store the tile data from the serial response.
            // This is necessary to later re-order the data based on the reorderMatrix.
            for (i = 0; i < splitArray.length; i += 3) {
                let x = splitArray[i].substring(2, 3);
                let y = splitArray[i].substring(4, 5);
                let id = (3 - Number(y)) * 4 + Number(x) + 1;

                let current = Number(splitArray[i + 1]);
                let target = Number(splitArray[i + 2]);
                let delta = Math.abs(current - target);

                if (delta > maxObservedDelta) maxObservedDelta = delta;

                dictionaryOfTemps[splitArray[i]] = { Current: splitArray[i + 1], Target: splitArray[i + 2], ID: id };
            }

            // Clamp dynamic range between 1°C and 10°C
            maxObservedDelta = Math.max(1, Math.min(maxObservedDelta, 10));

            // Use the reorderMatrix to map the tile data to the correct positions
            // in the observable array used by the knockout jinja2 template.
            reorderMatrix.forEach(function (index) {
                let tileName = splitArray[index];
                let currentTemp = splitArray[index + 1];
                let targetTemp = splitArray[index + 2];
                let newClass = "";
                let inlineStyle = "";

                if (targetTemp == "0.00") {
                    // Inactive tile: keep disabled class, no gradient
                    newClass = classOff;
                    inlineStyle = "";
                } else {
                    // For non-idle tiles, capture the largest delta for dynamic scaling
                    let delta = Math.abs(Number(currentTemp) - Number(targetTemp));
                    if (delta > maxObservedDelta) maxObservedDelta = delta;

                    // Active tile: no special class, use gradient color
                    newClass = "";
                    let bg = tempToColor(Number(currentTemp), Number(targetTemp), maxObservedDelta);
                    let fg = getContrastTextColor(bg);
                    inlineStyle = "background-color:" + bg + "; color:" + fg + ";";
                }

                self.heatbedTileArray.push({
                    ID: self.heatbedTileArray().length,
                    Tile: tileName,
                    Current: currentTemp,
                    Target: targetTemp,
                    Style: newClass,
                    InlineStyle: inlineStyle
                });
            });
        }
    }


    /* view model class, parameters for constructor, container to bind to
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: SegmentedbedViewModel,

        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: ["terminalViewModel", "settingsViewModel"],
    
        // Elements to bind to, e.g. #settings_plugin_segmentedbed, #tab_plugin_segmentedbed, ...
        elements: ["#tab_plugin_segmentedbed"]
    });
});
