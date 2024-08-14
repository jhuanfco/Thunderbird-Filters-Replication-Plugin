var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { MailServices } = ChromeUtils.import("resource:///modules/MailServices.jsm");
//var xulAppInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);

var filterManagerApi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      filterManagerApi: {
//Inicio de funciones    

        async getAccountsInfo() {
          try {
            let accountManager = MailServices.accounts;
            let accounts = accountManager.accounts;
            let accountsInfo = [];

            for (let account of accounts) {
              let server = account.incomingServer;
              if (server) {
                let filterFilePath = server.localPath.clone();
                filterFilePath.append("msgFilterRules.dat");
                
                accountsInfo.push({
                  key: account.key,
                  name: server.prettyName,
                  filterFilePath: filterFilePath.path
                });
              }
            }

            return accountsInfo;
          } catch (error) {
            console.error('Error en getAccountsInfo:', error);
            return [];
          }
        },

//Fin de funciones        
      },
    };
  }
};



