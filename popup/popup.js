
// Espera a que el documento (DOM) esté completamente cargado antes de ejecutar cualquier código
document.addEventListener('DOMContentLoaded', () => {
    // Selecciona los elementos HTML que se utilizarán en el script
    const sourceSelect = document.getElementById('source-account'); 
    const targetSelect = document.getElementById('target-account'); 
    const sourceFiltersSelect = document.getElementById('source-filters'); 
    const targetFiltersContainer = document.getElementById('target-filters-container'); 
    const targetFiltersList = document.getElementById('target-filters-list'); 
    const copyButton = document.getElementById('copy-button'); 

    // Array para almacenar la información de las cuentas
    let accountsData = []; 

   
    /** 
     * Función para rellenar los selectores de cuentas con los datos de las cuentas obtenidas
     * Parámetros de entrada: 
     *      select: elemento select del DOM  
     *      accounts: Array de objetos que vamos a mostrar en el select.
     *  */ 
    
    function selectAccount(select, accounts) {
        // Opción por defecto
        select.innerHTML = '<option value="">Seleccione una cuenta</option>'; 
        // Agrega cada cuenta como una opción
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.key; 
            option.textContent = account.name; 
            select.appendChild(option); 
        });
    }

    /** 
     * Función para actualizar los filtros disponibles en la cuenta de origen seleccionada
     * Parámetros de entrada: 
     *      select: elemento select del DOM que contiene la cuenta de origen seleccionada
     *      filtersSelect: elemento select del DOM donde se mostrarán los filtros disponibles
     */
    async function updateSourceFilters(select, filtersSelect) {
        const selectedAccount = accountsData.find(account => account.key === select.value);
        if (selectedAccount) {
            try {
                // Llama a la API para leer el archivo de filtros de la cuenta seleccionada
                const filters = await browser.filterCopyApi.readFiltersFile(selectedAccount.filterFilePath);
                // Reinicia el selector de filtros
                filtersSelect.innerHTML = '<option value="">Seleccione un filtro</option>'; 
                // Agrega cada filtro como una opción
                filters.forEach(filter => {
                    const option = document.createElement('option');
                    // Guardar el filtro como un JSON en el valor de la opción
                    option.value = JSON.stringify(filter); 
                    // Mostrar el nombre del filtro en la lista
                    option.textContent = filter.name; 
                    filtersSelect.appendChild(option);
                });
                // Mostrar el selector de filtros
                filtersSelect.style.display = 'block'; 
            } catch (error) {
                // Manejar el error si ocurre y oculta el selector si ocurre un error
                console.error('Error al leer los filtros de origen:', error); 
                filtersSelect.style.display = 'none'; 
            }
        } else {
            // Ocultar el selector si no hay cuenta seleccionada
            filtersSelect.style.display = 'none'; 
        }
         // Actualizar el estado del botón de copiar
        updateCopyButtonState();
    }

    /** 
     * Función para actualizar la lista de filtros existentes en la cuenta de destino seleccionada
     * Parámetros de entrada: 
     *      select: elemento select del DOM que contiene la cuenta de destino seleccionada
     *      listContainer: elemento del DOM que contiene la lista de filtros
     *      filtersList: elemento ul del DOM donde se mostrarán los filtros existentes
     */
    async function updateTargetFilters(select, listContainer, filtersList) {
        const selectedAccount = accountsData.find(account => account.key === select.value);
        if (selectedAccount) {
            try {
                // Llama a la API para leer el archivo de filtros de la cuenta seleccionada
                const filters = await browser.filterCopyApi.readFiltersFile(selectedAccount.filterFilePath);
                // Reinicia el selector de filtros
                filtersList.innerHTML = ''; 
                // Reinicia el selector de filtros
                filters.forEach(filter => {
                    const li = document.createElement('li');
                    // Mostrar el nombre del filtro en la lista
                    li.textContent = filter.name;
                    filtersList.appendChild(li); 
                });
                // Mostrar el contenedor de filtros de destino
                listContainer.style.display = 'block'; 
            } catch (error) {
                // Manejar el error si ocurre y oculta el selector si ocurre un error
                console.error('Error al leer los filtros de destino:', error); 
                listContainer.style.display = 'none';
            }
        } else {
            // Ocultar el contenedor si no hay cuenta seleccionada
            listContainer.style.display = 'none'; 
        }
        // Actualizar el estado del botón de copiar
        updateCopyButtonState(); 
    }

    /**
     * Función para habilitar o deshabilitar el botón de copiar según el estado de los selectores
     * No tiene parámetros de entrada.
     * 
     * La función verifica si se han seleccionado una cuenta de origen, una cuenta de destino y un filtro.
     * Si todas las condiciones se cumplen, habilita el botón de copiar; de lo contrario, lo deshabilita.
     */
    function updateCopyButtonState() {
        copyButton.disabled = !(sourceSelect.value && targetSelect.value && sourceFiltersSelect.value);
    }

    /**
     * Función para manejar el evento de clic en el botón de copiar. Verifica que se seleccionen los valores antes de 
     * llamar la función de escribir el filtro.
     * No tiene parámetros de entrada.
     */
    async function handleCopyButtonClick() {
        // Seleccionamos los elementos necesarios para la copia del filtro. Cuentas de origen y destino y filtro a copiar.
        const sourceAccount = accountsData.find(account => account.key === sourceSelect.value); 
        const targetAccount = accountsData.find(account => account.key === targetSelect.value); 
        const selectedFilterJson = sourceFiltersSelect.value; 

        if (sourceAccount && targetAccount && selectedFilterJson) {
            try {
                // Parsea el filtro seleccionado desde JSON.  
                const selectedFilter = JSON.parse(selectedFilterJson); 
                console.log('Copiando filtro:', selectedFilter.name);
                console.log('Desde:', sourceAccount.filterFilePath);
                console.log('Hacia:', targetAccount.filterFilePath);
                
                // Escribir el filtro al final del archivo de filtros de la cuenta de destino
                await browser.filterCopyApi.appendFilterToAccount(targetAccount.filterFilePath, selectedFilter.content, targetAccount.key);
                console.log('Filtro copiado con éxito');
                // Notificar al usuario que el filtro fue copiado exitosamente
                alert('Filtro copiado con éxito'); 
            } catch (error) {
                // Manejar errores durante la copia. Notificar al usuario si ocurre un error
                console.error('Error al copiar el filtro:', error); 
                alert('Error al copiar el filtro: ' + error.message);  
            }
        } else {
            // Advertir al usuario si no se seleccionaron todos los campos requeridos. 
            console.error('Por favor, seleccione una cuenta origen, una cuenta destino y un filtro antes de copiar.');
            alert('Por favor, seleccione una cuenta origen, una cuenta destino y un filtro antes de copiar.'); 
        }
    }

    /**
     * Inicializa: obtiene la información de las cuentas, configura los selectores
     * y establece los event listeners para los elementos de la interfaz
     */
    browser.filterCopyApi.getAccountsInfo().then(accounts => {
        // Guardar los datos de las cuentas
        accountsData = accounts; 
        // rellenar el selector de cuenta de origen
        selectAccount(sourceSelect, accounts);
        // rellenar el selector de cuenta de destino
        selectAccount(targetSelect, accounts); 

        // Asignar funciones a los eventos de cambio y clic en la interfaz
        sourceSelect.addEventListener('change', () => updateSourceFilters(sourceSelect, sourceFiltersSelect));
        targetSelect.addEventListener('change', () => updateTargetFilters(targetSelect, targetFiltersContainer, targetFiltersList));
        sourceFiltersSelect.addEventListener('change', updateCopyButtonState);
        copyButton.addEventListener('click', handleCopyButtonClick);

        // Desactiva el  botón de copiar.
        updateCopyButtonState();
    }).catch(error => {
        // Manejar errores al obtener las cuentas
        console.error('Error al obtener las cuentas:', error); 
    });
});



/*
document.addEventListener('DOMContentLoaded', () => {
    const sourceSelect = document.getElementById('source-account');
    const targetSelect = document.getElementById('target-account');
    const sourceFiltersSelect = document.getElementById('source-filters');
    const targetFiltersContainer = document.getElementById('target-filters-container');
    const targetFiltersList = document.getElementById('target-filters-list');
    const copyButton = document.getElementById('copy-button');

    let accountsData = [];

    function selectAccount(select, accounts) {
        select.innerHTML = '<option value="">Seleccione una cuenta</option>';
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.key;
            option.textContent = account.name;
            select.appendChild(option);
        });
    }

    async function updateSourceFilters(select, filtersSelect) {
        const selectedAccount = accountsData.find(account => account.key === select.value);
        if (selectedAccount) {
            try {
                const filters = await browser.filterCopyApi.leeFichero(selectedAccount.filterFilePath);
                filtersSelect.innerHTML = '<option value="">Seleccione un filtro</option>';
                filters.forEach(filter => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify(filter); // Guardamos todo el objeto filtro
                    option.textContent = filter.name;
                    filtersSelect.appendChild(option);
                });
                filtersSelect.style.display = 'block';
            } catch (error) {
                console.error('Error al leer los filtros de origen:', error);
                filtersSelect.style.display = 'none';
            }
        } else {
            filtersSelect.style.display = 'none';
        }
        updateCopyButtonState();
    }

    async function updateTargetFilters(select, listContainer, filtersList) {
        const selectedAccount = accountsData.find(account => account.key === select.value);
        if (selectedAccount) {
            try {
                const filters = await browser.filterCopyApi.leeFichero(selectedAccount.filterFilePath);
                filtersList.innerHTML = '';
                filters.forEach(filter => {
                    const li = document.createElement('li');
                    li.textContent = filter.name;
                    filtersList.appendChild(li);
                });
                listContainer.style.display = 'block';
            } catch (error) {
                console.error('Error al leer los filtros de destino:', error);
                listContainer.style.display = 'none';
            }
        } else {
            listContainer.style.display = 'none';
        }
        updateCopyButtonState();
    }

    function updateCopyButtonState() {
        copyButton.disabled = !(sourceSelect.value && targetSelect.value && sourceFiltersSelect.value);
    }

    async function handleCopyButtonClick() {
        const sourceAccount = accountsData.find(account => account.key === sourceSelect.value);
        const targetAccount = accountsData.find(account => account.key === targetSelect.value);
        const selectedFilterJson = sourceFiltersSelect.value;

        if (sourceAccount && targetAccount && selectedFilterJson) {
            try {
                const selectedFilter = JSON.parse(selectedFilterJson);
                console.log('Copiando filtro:', selectedFilter.name);
                console.log('Desde:', sourceAccount.filterFilePath);
                console.log('Hacia:', targetAccount.filterFilePath);

                await browser.filterCopyApi.escribirAlFinal(targetAccount.filterFilePath, selectedFilter.content, targetAccount.key);
                console.log('Filtro copiado con éxito');
                alert('Filtro copiado con éxito');
            } catch (error) {
                console.error('Error al copiar el filtro:', error);
                alert('Error al copiar el filtro: ' + error.message);
            }
        } else {
            console.error('Por favor, seleccione una cuenta origen, una cuenta destino y un filtro antes de copiar.');
            alert('Por favor, seleccione una cuenta origen, una cuenta destino y un filtro antes de copiar.');
        }
    }

    browser.filterCopyApi.getAccountsInfo().then(accounts => {
        accountsData = accounts;
        selectAccount(sourceSelect, accounts);
        selectAccount(targetSelect, accounts);

        sourceSelect.addEventListener('change', () => updateSourceFilters(sourceSelect, sourceFiltersSelect));
        targetSelect.addEventListener('change', () => updateTargetFilters(targetSelect, targetFiltersContainer, targetFiltersList));
        sourceFiltersSelect.addEventListener('change', updateCopyButtonState);
        copyButton.addEventListener('click', handleCopyButtonClick);
    }).catch(error => {
        console.error('Error al obtener las cuentas:', error);
    });
});

*/
