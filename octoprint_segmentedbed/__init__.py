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
            # put your plugin's default settings here
        }

    ##~~ AssetPlugin mixin

    def get_assets(self):
        # Asset files to automatically include in the core UI here.
        return {
            "js": ["js/segmentedbed.js"],
            "css": ["css/segmentedbed.css"],
            "less": ["less/segmentedbed.less"]
        }

    ##~~ Softwareupdate hook

    def get_update_information(self):
        # Define the configuration for your plugin to use with the Software Update
        # Plugin here. See https://docs.octoprint.org/en/master/bundledplugins/softwareupdate.html
        # for details.
        return {
            "segmentedbed": {
                "displayName": "Segmentedbed Plugin",
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


# If you want your plugin to be registered within OctoPrint under a different name than what you defined in setup.py
# ("OctoPrint-PluginSkeleton"), you may define that here. Same goes for the other metadata derived from setup.py that
# can be overwritten via __plugin_xyz__ control properties. See the documentation for that.
__plugin_name__ = "Segmented Bed"


# Set the Python version your plugin is compatible with below. Recommended is Python 3 only for all new plugins.
__plugin_pythoncompat__ = ">=3,<4"  # Only Python 3

def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = SegmentedbedPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
