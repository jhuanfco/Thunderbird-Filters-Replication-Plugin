var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
//var xulAppInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);

var filterManagerApi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      filterManagerApi: {
        async filterManager() {
          try {
            let recentWindow = Services.wm.getMostRecentWindow("mail:3pane");
            if (recentWindow) {
              console.log("Abriendo nueva ventana de filtros");
              recentWindow.MsgFilters();
              console.log("Ventana de filtros debería estar abierta");
              return recentWindow;
            }
          } catch (error) {
            console.error("Error en filterManager:", error);
          }
          console.log("No se pudo abrir la ventana de filtros");
          return null;
        },

        async getSelectedAccount() {
          console.log('Iniciando getSelectedAccount');
          try {
            let mainWindow = await this.filterManager();
            if (!mainWindow) {
              console.log('No se pudo obtener la ventana principal');
              return null;
            }
            console.log('Ventana principal obtenida');

            let accountManager = mainWindow.MailServices.accounts;
            let accounts = accountManager.accounts;

            if (accounts.length > 0) {
              let defaultAccount = accountManager.defaultAccount;
              console.log('Cuenta seleccionada:', defaultAccount.key);
              return {
                key: defaultAccount.key,
                name: defaultAccount.incomingServer.prettyName
              };
            }

            console.log('No se encontraron cuentas');
          } catch (error) {
            console.error('Error en getSelectedAccount:', error);
          }
          return null;
        }
      },
    };
  }
};

