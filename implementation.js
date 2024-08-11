var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var xulAppInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);

var filterManagerApi = class extends ExtensionCommon.ExtensionAPI {
    getAPI(context) {
    return {
      filterManagerApi: {
        async filterManager() {
          let recentWindow = Services.wm.getMostRecentWindow("mail:3pane");
          if (recentWindow) {
            recentWindow.MsgFilters();
          }
        },
      },
    };
  }
};