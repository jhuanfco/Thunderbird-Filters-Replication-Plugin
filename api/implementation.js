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
 //             console.log("Abriendo nueva ventana de filtros");
              recentWindow.MsgFilters();
 //             console.log("Ventana de filtros debería estar abierta");
              return recentWindow;
            }
          } catch (error) {
            console.error("Error en filterManager:", error);
          }
          console.log("No se pudo abrir la ventana de filtros");
          return null;
        },

        async getSelectedAccount() {
//          console.log('Iniciando getSelectedAccount');
          try {
            let mainWindow = await this.filterManager();
            if (!mainWindow) {
              console.log('No se pudo obtener la ventana principal');
              return null;
            }
//            console.log('Ventana principal obtenida');

            let accountManager = mainWindow.MailServices.accounts;
            let accounts = accountManager.accounts;
            console.log('NUMERO DE CUENTAS:', accounts.length);
            console.log('accountManager:', accountManager);
//           console.log('accounts:', accounts);

            if (accounts.length > 0) {
              let numeroCuentas = -1;
              do{
              numeroCuentas++;
              let selectedAccount = accounts[numeroCuentas];
              console.log('CONTADOR:', numeroCuentas);
              console.log('Cuenta seleccionada:', selectedAccount);
              console.log('Cuenta seleccionada:', selectedAccount.key);
              console.log('1 4:', selectedAccount.incomingServer.prettyName);
              console.log('1 5:', selectedAccount.incomingServer.localPath.path);
//              console.log('1 1:', selectedAccount.defaultIdentity.archiveFolder);
              } while (numeroCuentas < accounts.length-1)

              let selectedAccount = accounts[1];
              return {
                key: selectedAccount.key,
                name: selectedAccount.incomingServer.prettyName
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

