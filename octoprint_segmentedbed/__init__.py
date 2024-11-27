# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin

class SegmentedbedPlugin(octoprint.plugin.SettingsPlugin,
    octoprint.plugin.AssetPlugin,
    octoprint.plugin.TemplatePlugin,
    octoprint.plugin.StartupPlugin
):

    ##~~ SettingsPlugin mixin

    def get_settings_defaults(self):
        return {
            # No default settings for now - reserved for future use
        }

    ##~~ AssetPlugin mixin

    def get_assets(self):
        # Asset files to automatically include in the core UI
        return {
            "js": [ "js/segmentedbed.js" ],
            "css": [ "css/segmentedbed.css" ]
        }

    ##~~ Softwareupdate hook

    def get_update_information(self):
        return {
            "segmentedbed": {
                "displayName": "Segmented Bed Plugin",
                "displayVersion": self._plugin_version,

                # version check: github repository
                "type": "github_release",
                "user": "DoubleStrike",
                "repo": "OctoPrint-SegmentedBed",
                "current": self._plugin_version,

                # update method: pip
                "pip": "https://github.com/DoubleStrike/OctoPrint-SegmentedBed/archive/{target_version}.zip",
            }
        }
        
    ##~~ StartupPlugin mixin

    def on_after_startup(self):
        self._logger.info("Segmented bed plugin started up.")


__plugin_name__ = "Segmented Bed"

__plugin_pythoncompat__ = ">=3,<4"  # Only Python 3

def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = SegmentedbedPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
