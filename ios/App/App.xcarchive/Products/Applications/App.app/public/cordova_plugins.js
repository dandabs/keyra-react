
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-background-geolocation-plugin.BackgroundGeolocation",
          "file": "plugins/cordova-background-geolocation-plugin/www/BackgroundGeolocation.js",
          "pluginId": "cordova-background-geolocation-plugin",
        "clobbers": [
          "BackgroundGeolocation"
        ]
        },
      {
          "id": "cordova-background-geolocation-plugin.radio",
          "file": "plugins/cordova-background-geolocation-plugin/www/radio.js",
          "pluginId": "cordova-background-geolocation-plugin"
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-background-geolocation-plugin": "2.3.1"
    };
    // BOTTOM OF METADATA
    });
    