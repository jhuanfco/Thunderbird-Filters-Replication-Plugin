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


/*
console.log("Background cargado correctamente");

function klickaktion() {
console.log("Llamada a la ventana desde bacground.");
  
    browser.filterManagerApi.filterManager();


    browser.filterManagerApi.getSelectedAccount().then(account => {
      if (account) {
        console.log(`Cuenta seleccionada: ${account.name} (${account.key})`);
      } else {
        console.log("No se pudo obtener la cuenta seleccionada");
      }
    });


  }
  browser.browserAction.onClicked.addListener(klickaktion);


*/

/*
console.log("Background cargado correctamente");

function klickaktion() {
    browser.filterManagerApi.filterManager();
  }
  browser.browserAction.onClicked.addListener(klickaktion);

**/