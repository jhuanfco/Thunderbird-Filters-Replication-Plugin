// código para acceder sin abrir la ventana de filtros
console.log("Background cargado correctamente");

function pulsarClick() {
  console.log("Obteniendo información de las cuentas...");
  
  browser.filterManagerApi.getAccountsInfo()
    .then(accounts => {
      if (accounts && accounts.length > 0) {
        accounts.forEach(account => {
          console.log(`Cuenta: ${account.name} (${account.key})`);
          console.log(`Ruta del archivo de filtros: ${account.filterFilePath}`);
        });
      } else {
        console.log("No se encontraron cuentas");
      }
    })
    .catch(error => {
      console.error("Error al obtener la información de las cuentas:", error);
    });
}

browser.browserAction.onClicked.addListener(pulsarClick);




/*
// código que accede abriendo la ventana de filtros.
console.log("Background cargado correctamente");

function klickaktion() {
  console.log("Llamada a la ventana desde background.");
  
  browser.filterManagerApi.getSelectedAccount()
    .then(account => {
      if (account) {
        console.log(`Cuenta seleccionada: ${account.name} (${account.key})`);
      } else {
        console.log("No se pudo obtener la cuenta seleccionada");
      }
    })
    .catch(error => {
      console.error("Error al obtener la cuenta seleccionada:", error);
    });
}


browser.browserAction.onClicked.addListener(klickaktion);
*/