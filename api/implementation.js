var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { MailServices } = ChromeUtils.import("resource:///modules/MailServices.jsm");

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

        async  leeFichero(filePath) {
          try {
            // Usar APIs nativas de Thunderbird para leer archivos
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

            // Procesar los datos para crear el array de filtros
            return this.procesarFiltros(data);

           // return data;
            
          } catch (error) {
            console.error('Error al abrir el archivo:', error);
            throw error;
          }
        },
        
        async  escribirAlFinal(rutaFichero, linea) {
          try {
              // Usar APIs nativas de Thunderbird para acceder al archivo
              let file = Components.classes["@mozilla.org/file/local;1"]
                                   .createInstance(Components.interfaces.nsIFile);
              file.initWithPath(rutaFichero);
      
              let fstream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                                       .createInstance(Components.interfaces.nsIFileOutputStream);
      
              // Abre el archivo en modo escritura, permitiendo agregar al final (modo 0x02)
              fstream.init(file, 0x02 | 0x10, 0o666, 0);
      
              // Crear una instancia para convertir la cadena a un flujo de datos
              let cstream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                                       .createInstance(Components.interfaces.nsIConverterOutputStream);
      
              cstream.init(fstream, "UTF-8", 0, 0);
      
              // Escribe la línea al final del archivo
              cstream.writeString("\n" + linea);
      
              // Cerrar ambos streams
              cstream.close();
              fstream.close();
      
              console.log('Línea añadida correctamente.');
          } catch (err) {
              console.error(`Error al escribir en el archivo: ${err}`);
              throw err;
          }
      },
      
      procesarFiltros(data) {
        // Dividir el contenido en líneas
        const lineas = data.split('\n');
        const filtros = [];
        let filtroActual = null;

        for (const linea of lineas) {
          if (linea.startsWith('name=')) {
            // Nuevo filtro
            if (filtroActual) {
              filtros.push(filtroActual);
            }
            filtroActual = { name: linea.substring(5) };
          } else if (filtroActual) {
            // Añadir más información al filtro actual
            const [clave, valor] = linea.split('=');
            if (clave && valor) {
              filtroActual[clave] = valor;
            }
          }
        }

        // Añadir el último filtro si existe
        if (filtroActual) {
          filtros.push(filtroActual);
        }

        // Imprimir el array de filtros en la consola
        console.log('Array de filtros:', filtros);

        return filtros;
      },



//Fin de funciones        
      },
    };
  }
};



