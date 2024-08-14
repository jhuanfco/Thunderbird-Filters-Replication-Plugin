
console.log("SOY background.js iniciando");

browser.browserAction.onClicked.addListener(() => {
     console.log("SOY background.js abriendo popup");

    // Crear y abrir una ventana emergente con contenido de popup.html
    browser.windows.create({
        url: "popup/popup.html",
        type: "popup",
        width: 800,
        height: 600
    });
  
});
