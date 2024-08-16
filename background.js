// Registra un mensaje en la consola cuando el script se inicia
//console.log("Inicio de la extensión Thunderbird Filter Copier. ");

// Añade un listener para el evento de clic en el botón de la extensión
browser.browserAction.onClicked.addListener(() => {
    // Registra un mensaje en la consola cuando se hace clic en el botón
    // console.log("SOY background.js abriendo popup");

    // Crea y abre una ventana emergente con el contenido de popup.html
    browser.windows.create({
        url: "popup/popup.html",  // URL del archivo HTML de la ventana emergente
        type: "popup",            // Tipo de ventana: una ventana emergente
        width: 800,               // Ancho de la ventana en píxeles
        height: 600               // Alto de la ventana en píxeles
    });
});


/*

Event Listener:
   Se añade un event listener al botón de la extensión (browser.browserAction) para el evento 'onClicked'.
   Esto significa que la función proporcionada se ejecutará cada vez que el usuario haga clic en el 
   icono de la extensión en la barra de herramientas de Thunderbird.

Acción del clic:
   Se crea una nueva ventana utilizando browser.windows.create().

Este script  maneja la interacción inicial del usuario (hacer clic en el icono de la extensión) y abre la interfaz principal de la extensión 
(la ventana emergente). La ventana emergente contendrá la interfaz de usuario principal para la funcionalidad de copia de filtros entre cuentas.

*/
