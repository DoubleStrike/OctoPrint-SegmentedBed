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

        function updateLegend(minTemp, maxTemp, dynamicMaxDelta) {
            const hotBase = getHotColor();
            const coldBase = getColdColor();

            // Build gradient CSS
            const gradient = `linear-gradient(to right, ${coldBase}, transparent, ${hotBase})`;

            const legendHtml = `
        <div style="display:flex; align-items:center; gap:10px; font-size:0.9em;">
            <span>${minTemp.toFixed(1)}°C</span>
            <div style="
                flex:1;
                height: 14px;
                border-radius: 7px;
                background: ${gradient};
                border: 1px solid rgba(255,255,255,0.2);
            "></div>
            <span>${maxTemp.toFixed(1)}°C</span>
        </div>
        <div style="text-align:center; font-size:0.8em; opacity:0.7;">
            ΔT range scaled to ${dynamicMaxDelta.toFixed(1)}°C
        </div>
    `;

            $("#segmentedbed-legend").html(legendHtml);
        }


        // Array data model: ID, Tile, Current, Target, Style
        self.heatbedTileArray = ko.observableArray();

        // Average bed temp
        self.HotEndTemp = ko.observable();

        // Average bed temp
        self.AvgBedTemp = ko.observable();

        // NEW: robust structured parser
        function parseBedTiles(line) {
            const matches = [...line.matchAll(/(\S+):([-\d.]+)\/([-\d.]+)/g)];
            const tiles = [];

            for (const m of matches) {
                const key = m[1];
                const current = Number(m[2]);
                const target = Number(m[3]);

                // Only bed tiles: B_x_y
                const tileMatch = key.match(/^B_(\d)_(\d)$/);
                if (!tileMatch) continue;

                const x = Number(tileMatch[1]);
                const y = Number(tileMatch[2]);

                tiles.push({ key, x, y, current, target });
            }

            return tiles;
        }

        self.fromCurrentData = function (data) {
            if (!data || !data.logs) return;
            
            // Data parsing -----------------------------------------------------------------------
            // Capture current log line
            var newLogData = data.logs[0];
            if (!newLogData || typeof newLogData == 'undefined') return;
            newLogData = newLogData.trim();
            
            // Extract the portion after @5:0
            if (newLogData.search("@5:0") < 10) return;
            var preParseData = newLogData.split("@5:0 ")[1];

            // Split into tokens (name, current, target) to get the order for reordering later
            var splitArray = preParseData.split(/[\s\:\/]+/);

            // As of firmware 6.2.6+8948 the expected line is in this format (without line wraps obviously):
            /*
            Recv:  T:6.00/0.00 B:22.17/0.00 C:-30.00/0.00 X5:6.00/36.00 A:35.81/0.00 T0:22.00/0.00 T1:25.00/0.00 T2:23.00/0.00 
            T3:24.00/0.00 T4:23.00/0.00 T5:6.00/0.00 @:0 B@:0 HBR@:0 @0:0 @1:0 @2:0 @3:0 @4:0 @5:0 B_0_0:21.80/0.00 B_1_0:21.90/0.00 
            B_2_0:21.90/0.00 B_3_0:22.00/0.00 B_0_1:22.20/0.00 B_1_1:22.20/0.00 B_2_1:22.30/0.00 B_3_1:22.10/0.00 B_0_2:22.20/0.00 
            B_1_2:22.40/0.00 B_2_2:22.40/0.00 B_3_2:22.30/0.00 B_0_3:22.30/0.00 B_1_3:22.20/0.00 B_2_3:22.40/0.00 B_3_3:22.40/0.00

            For reference, the T is active tool temperature, B is average bed temp, C is heated chamber temp, @ is heater power,
            HBR@ is heatbreak temp, T0-T5 are the toolhead temps.  Sourced from "lib/Marlin/Marlin/src/module/temperature.cpp"
            */

            // Grab the hot-end temp reading
            const toolTempMatch = newLogData.match(/T:([-\d.]+)\//);
            if (toolTempMatch) self.HotEndTemp(toolTempMatch[1]);
            
            // Grab the average bed temp reading
            const bedTempMatch = newLogData.match(/B:([-\d.]+)\//);
            if (bedTempMatch) self.AvgBedTemp(bedTempMatch[1]);

            // Parse all bed tiles
            const tiles = parseBedTiles(newLogData);
            if (tiles.length === 0) return;

            const tileDict = {};
            for (const t of tiles) tileDict[t.key] = t;
            // Data parsing -----------------------------------------------------------------------

            // Dynamic scaling --------------------------------------------------------------------
            // Compute dynamic max delta for dynamic scaling
            let maxObservedDelta = 0;
            for (const t of tiles) {
                const delta = Math.abs(t.current - t.target);
                if (delta > maxObservedDelta) maxObservedDelta = delta;
            }

            // Clamp dynamic range between 1°C and 10°C
            maxObservedDelta = Math.max(1, Math.min(maxObservedDelta, 10));
            // Dynamic scaling --------------------------------------------------------------------

            // Color legend -----------------------------------------------------------------------
            // Compute actual min/max tile temps
            let minTemp = Math.min(...tiles.map(t => t.current));
            let maxTemp = Math.max(...tiles.map(t => t.current));

            // Update legend
            updateLegend(minTemp, maxTemp, maxObservedDelta);
            // Color legend -----------------------------------------------------------------------

            self.heatbedTileArray.removeAll();

            // Use the reorderMatrix to map the tile data to the correct positions
            // in the observable array used by the knockout jinja2 template.
            reorderMatrix.forEach(function (index) {
                const tileName = splitArray[index];   // B_0_0, B_1_0, etc.
                const tile = tileDict[tileName];
                if (!tile) return;

                let inlineStyle = "";
                let newClass = "";

                if (tile.target === 0) {
                    // Inactive tile: keep disabled class, no gradient
                    newClass = classOff;
                } else {
                    // Active tile: no special class, use gradient color
                    let bg = tempToColor(tile.current, tile.target, maxObservedDelta);
                    let fg = getContrastTextColor(bg);
                    inlineStyle = `background-color:${bg}; color:${fg}; font-weight: bold;`;
                }

                self.heatbedTileArray.push({
                    ID: self.heatbedTileArray().length,
                    Tile: tile.key,
                    Current: tile.current.toFixed(2),
                    Target: tile.target.toFixed(2),
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
