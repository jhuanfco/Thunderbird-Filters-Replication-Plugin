console.log("Background cargado correctamente");

function klickaktion() {
    browser.filterManagerApi.filterManager();
  }
  browser.browserAction.onClicked.addListener(klickaktion);