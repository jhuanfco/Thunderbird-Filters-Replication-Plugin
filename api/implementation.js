// Importar los módulos necesarios de Thunderbird
var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { MailServices } = ChromeUtils.import("resource:///modules/MailServices.jsm");

// Definir la clase que extiende la API de la extensión
var filterCopyApi = class extends ExtensionCommon.ExtensionAPI {
  
  // Método para obtener la API que se expone a la extensión
  getAPI(context) {
    return {
      filterCopyApi: {

        /**
         * Función para obtener la información de las cuentas configuradas en Thunderbird
         * No tiene parámetros de entrada.
         * 
         * Retorna un array de objetos con la clave de la cuenta, el nombre del servidor y la ruta al archivo de filtros.
         */
        async getAccountsInfo() {
          try {
            // Obtener el gestor de cuentas
            let accountManager = MailServices.accounts;
            // Obtener todas las cuentas 
            let accounts = accountManager.accounts; 
            // Array para almacenar la información de las cuentas
            let accountsInfo = []; 

            // Iterar sobre cada cuenta para extraer la información necesaria
            for (let account of accounts) {
              // Obtener el servidor de entrada
              let server = account.incomingServer; 
              if (server) {
                // Crea una ruta al archivo de reglas de filtro para esta cuenta
                let filterFilePath = server.localPath.clone();
                // Añade el nombre del archivo de reglas de filtro a la ruta
                filterFilePath.append("msgFilterRules.dat");
                
                // Añade la información de la cuenta al array
                accountsInfo.push({
                  key: account.key, // Clave única de la cuenta
                  name: server.prettyName, // Nombre descriptivo del servidor
                  filterFilePath: filterFilePath.path // Ruta completa al archivo de filtros
                });
              }
            }
            
            // Devolver array con la información de todas las cuentas
            return accountsInfo; 
          } catch (error) {
            // Gestionar si ocurre algún error y retornar un array vacío.
            console.error('Error en getAccountsInfo:', error);
            return []; 
          }
        },


        /**
         * Función para leer y procesar el archivo de filtros de una cuenta
         * Parámetros de entrada:
         *      filePath: String que representa la ruta completa al archivo de filtros.
         * 
         * Retorna un array de objetos que representan los filtros contenidos en el archivo.
         */
        async readFiltersFile(filePath) {
          try {
            // Creación de una instancia de nsIFile para manejar el archivo
            let file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
            // Inicializa el objeto file con la ruta del archivo proporcionada
            file.initWithPath(filePath);
            
       
            // Crea un stream de entrada para leer el archivo
            let fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
            // Crea un stream de conversión para manejar la codificación del archivo
            let cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(Components.interfaces.nsIConverterInputStream);

            // Inicializa el file input stream. -1 significa abrir el archivo en modo de solo lectura (predeterminado).
            fstream.init(file, -1, 0, 0);

            // Inicializa el converter input stream. "UTF-8" es la codificación de caracteres a utilizar, 
            // y 0 es el tamaño del buffer; 0 indica que se debe utilizar el tamaño de buffer predeterminado.
            cstream.init(fstream, "UTF-8", 0, 0);

            // Variable para almacenar todo el contenido del archivo
            let data = "";
            // Objeto para almacenar cada fragmento leído
            let str = {};
            // Variable para rastrear cuántos bytes se leen
            let read = 0;

            // Lee el archivo en fragmentos hasta final del fichero,
            do {
              // Lee hasta 4,294,967,295 caracteres (0xFFFFFFFF) en cada iteración
              read = cstream.readString(0xFFFFFFFF, str);
              // Añade el fragmento leído a la variable data
              data += str.value;
            } while (read != 0);

            // Cerrar el stream de entrada
            cstream.close(); 

            // Cierra el file input stream
            fstream.close();

            // Procesar los filtros leídos y se devuelven.
            return this.procesarFiltros(data);

          } catch (error) {
            // Si ocurre un error, lo registra y lo lanza.
            console.error('Error al abrir el archivo:', error);
            throw error; 
          }
        },

        /**
         * Función para procesar el contenido del archivo de filtros
         * Parámetros de entrada:
         *      data: String que contiene el contenido completo del archivo de filtros.
         * 
         * Retorna un array de objetos que representan los filtros, con sus nombres y contenido.
         */
        procesarFiltros(data) {
          // Divide el contenido del archivo en un array de líneas
          // Esto permite procesar el archivo línea por línea
          const lineas = data.split('\n'); 

          // Array para almacenar los filtros procesados
          const filtros = []; 

          // Variable para almacenar el filtro que se está procesando actualmente
          // Será null cuando no se esté procesando ningún filtro
          let filtroActual = null;

          // Iterar sobre cada línea del archivo
          for (const linea of lineas) {
            // Detectar el inicio de un nuevo filtro
            if (linea.startsWith('name=')) { 
            
              // Si ya estábamos procesando un filtro, lo añadimos al array
              // Esto ocurre cuando encontramos un nuevo filtro y el anterior ya está completo
              if (filtroActual) {
                filtros.push(filtroActual); 
              }

              // Inicia un nuevo objeto filtro
              // El nombre del filtro es todo lo que viene después de 'name='
              // Se guarda también la línea completa como inicio del contenido del filtro
              filtroActual = { 
                name: linea.substring(5), 
                content: linea 
              }; 

              // Si no es el inicio de un nuevo filtro y estamos procesando un filtro,
              // añadimos la línea actual al contenido del filtro
              // Se añade un salto de línea para mantener el formato original
            } else if (filtroActual) {
              filtroActual.content += '\n' + linea; 
            }
            // Si la línea no comienza con 'name=' y no estamos procesando un filtro,
            // simplemente la ignoramos (podría ser una línea en blanco al inicio del archivo)
          }

          // Después de procesar todas las líneas, comprobamos si hay un último filtro para añadir
          // Esto es necesario porque el último filtro no sería añadido en el bucle
          if (filtroActual) {
            filtros.push(filtroActual); 
          }
          // Devolver los filtros procesados
          return filtros;
        },

        /**
         * Función para añadir un filtro al archivo de filtros de una cuenta específica
         * Parámetros de entrada:
         *      targetFilePath: String que representa la ruta completa al archivo de filtros.
         *      filterRules: String que contiene el contenido del filtro a añadir.
         *      accountKey: String que representa la clave de la cuenta a la que pertenece el archivo de filtros.
         * 
         * Retorna un valor booleano que indica si la operación fue exitosa.
         */
        async appendFilterToAccount(targetFilePath, filterRules, accountKey) {
          try {
            // Creación de una instancia de nsIFile para manejar el archivo
            let file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
            // Inicializar file con la ruta proporcionada.
            file.initWithPath(targetFilePath);
    
            
            // Crea un steam de salida para escribir el archivo.
            let fstream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
    
            // Inicializar el stream de salida
            // 0x02 | 0x10 son flags que indican:
            // - 0x02 (PR_WRONLY): Abrir para escritura solamente
            // - 0x10 (PR_APPEND): Añadir al final del archivo
            // 0o666 son los permisos del archivo (lectura y escritura para todos)
            fstream.init(file, 0x02 | 0x10, 0o666, 0);
    
            // Crear un stream de conversión para manejar la codificación del archivo
            // Esto nos permite escribir texto en UTF-8
            let cstream = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
   
            
            // Inicializar el stream de conversión
            // "UTF-8" es la codificación, 0 es el tamaño del buffer (predeterminado)
            cstream.init(fstream, "UTF-8", 0, 0);
    
            // Escribir el nuevo filtro al final del archivo
            // Añadimos un salto de línea antes del contenido para asegurar que comience en una nueva línea
            cstream.writeString("\n" + filterRules);

            // Cerrar los streams para liberar recursos y asegurar que todos los datos se escriban
            cstream.close(); 
            fstream.close(); 
    
            console.log('Filtro añadido correctamente.');

            // Notificar a Thunderbird del cambio
            await this.notifyFilterChange(accountKey);

            // Indicar que la operación fue exitosa
            return true; 
          } catch (err) {
             // Si ocurre un error, lo registra y lo lanza.
            console.error(`Error al escribir en el archivo: ${err}`);
            throw err; 
          }
        },

        /**
         * Función para notificar a Thunderbird sobre un cambio en los filtros de una cuenta
         * Parámetros de entrada:
         *      accountKey: String que representa la clave de la cuenta cuyos filtros han cambiado.
         * 
         */
        async notifyFilterChange(accountKey) {
          try {
            console.log('Notificando cambio de filtros para la cuenta:', accountKey);
            // Obtener la cuenta por su clave
            let account = MailServices.accounts.getAccount(accountKey); 
            if (account && account.incomingServer) {
              console.log('Cuenta encontrada, obteniendo lista de filtros');
              // Obtener la lista de filtros de la cuenta
              let filterList = account.incomingServer.getFilterList(null); 
              
              if (filterList) {
                console.log('Lista de filtros obtenida, intentando actualizar');
                // Guardar los cambios en el archivo de filtros
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
              
              // Notificar a las ventanas abiertas de Thunderbird sobre el cambio
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

