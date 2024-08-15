var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { MailServices } = ChromeUtils.import("resource:///modules/MailServices.jsm");

var filterManagerApi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      filterManagerApi: {
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

        async leeFichero(filePath) {
          try {
            let file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
            file.initWithPath(filePath);
            
            let fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
            let cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(Components.interfaces.nsIConverterInputStream);

            fstream.init(file, -1, 0, 0);
            cstream.init(fstream, "UTF-8", 0, 0);

            let data = "";
            let str = {};
            let read = 0;
            do {
              read = cstream.readString(0xffffffff, str);
              data += str.value;
            } while (read != 0);

            cstream.close();

            return this.procesarFiltros(data);
          } catch (error) {
            console.error('Error al abrir el archivo:', error);
            throw error;
          }
        },

        procesarFiltros(data) {
          const lineas = data.split('\n');
          const filtros = [];
          let filtroActual = null;

          for (const linea of lineas) {
            if (linea.startsWith('name=')) {
              if (filtroActual) {
                filtros.push(filtroActual);
              }
              filtroActual = { name: linea.substring(5), content: linea };
            } else if (filtroActual) {
              filtroActual.content += '\n' + linea;
            }
          }

          if (filtroActual) {
            filtros.push(filtroActual);
          }

          return filtros;
        },

        async escribirAlFinal(rutaFichero, contenidoFiltro, accountKey) {
          try {
            let file = Components.classes["@mozilla.org/file/local;1"]
                                 .createInstance(Components.interfaces.nsIFile);
            file.initWithPath(rutaFichero);
    
            let fstream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                                     .createInstance(Components.interfaces.nsIFileOutputStream);
    
            fstream.init(file, 0x02 | 0x10, 0o666, 0);
    
            let cstream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                                     .createInstance(Components.interfaces.nsIConverterOutputStream);
    
            cstream.init(fstream, "UTF-8", 0, 0);
    
            cstream.writeString("\n" + contenidoFiltro);
    
            cstream.close();
            fstream.close();
    
            console.log('Filtro añadido correctamente.');

            // Notificar a Thunderbird del cambio
            await this.notifyFilterChange(accountKey);

            return true;
          } catch (err) {
            console.error(`Error al escribir en el archivo: ${err}`);
            throw err;
          }
        },

        async notifyFilterChange(accountKey) {
          try {
            console.log('Notificando cambio de filtros para la cuenta:', accountKey);
            let account = MailServices.accounts.getAccount(accountKey);
            if (account && account.incomingServer) {
              console.log('Cuenta encontrada, obteniendo lista de filtros');
              let filterList = account.incomingServer.getFilterList(null);
              
              if (filterList) {
                console.log('Lista de filtros obtenida, intentando actualizar');
                // Usar los métodos disponibles para actualizar la lista de filtros
                filterList.saveToDefaultFile();
                
                // Intentar recargar los filtros
                if (typeof filterList.defaultFile === 'function') {
                  let defaultFile = filterList.defaultFile();
                  if (defaultFile && typeof filterList.loadFromFile === 'function') {
                    filterList.loadFromFile(defaultFile);
                  }
                }
                
                // Asegurarse de que los cambios se apliquen
                if (typeof filterList.applyFilters === 'function') {
                  filterList.applyFilters();
                }
              } else {
                console.log('No se pudo obtener la lista de filtros');
              }
              
              // Notificar a las ventanas abiertas
              let windows = Services.wm.getEnumerator("mail:3pane");
              while (windows.hasMoreElements()) {
                let win = windows.getNext();
                if (win.gFilterListManager) {
                  console.log('Actualizando ventana de filtros');
                  win.gFilterListManager.rebuildFilterList();
                }
              }
        
              console.log('Thunderbird notificado del cambio en los filtros.');
            } else {
              console.log('No se encontró la cuenta o el servidor de entrada');
            }
          } catch (error) {
            console.error('Error al notificar a Thunderbird del cambio en los filtros:', error);
          }
        }
      },
    };
  }
};