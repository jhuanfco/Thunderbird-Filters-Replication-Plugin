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
                const filters = await browser.filterManagerApi.leeFichero(selectedAccount.filterFilePath);
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

    /*
    async function updateSourceFilters(select, filtersSelect) {
        const selectedAccount = accountsData.find(account => account.key === select.value);
        if (selectedAccount) {
            try {
                const filters = await browser.filterManagerApi.leeFichero(selectedAccount.filterFilePath);
                filtersSelect.innerHTML = '<option value="">Seleccione un filtro</option>';
                filters.forEach(filter => {
                    const option = document.createElement('option');
                    option.value = filter.name;
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
*/
    async function updateTargetFilters(select, listContainer, filtersList) {
        const selectedAccount = accountsData.find(account => account.key === select.value);
        if (selectedAccount) {
            try {
                const filters = await browser.filterManagerApi.leeFichero(selectedAccount.filterFilePath);
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

                await browser.filterManagerApi.escribirAlFinal(targetAccount.filterFilePath, selectedFilter.content, targetAccount.key);
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
/*
    function handleCopyButtonClick() {
        const sourceAccount = accountsData.find(account => account.key === sourceSelect.value);
        const targetAccount = accountsData.find(account => account.key === targetSelect.value);
        const selectedFilter = sourceFiltersSelect.value;

        if (sourceAccount && targetAccount && selectedFilter) {
            console.log('Filtro seleccionado de la cuenta origen:', selectedFilter);
            console.log('Ruta del fichero de filtros de la cuenta destino:', targetAccount.filterFilePath);
        } else {
            console.error('Por favor, seleccione una cuenta origen, una cuenta destino y un filtro antes de copiar.');
        }
    }
*/
    browser.filterManagerApi.getAccountsInfo().then(accounts => {
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



/*
document.addEventListener('DOMContentLoaded', () => {
    const sourceSelect = document.getElementById('source-account');
    const targetSelect = document.getElementById('target-account');
    const sourcePath = document.getElementById('source-path');
    const targetPath = document.getElementById('target-path');

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

   async function updatePath(select, pathElement) {
        const selectedAccount = accountsData.find(account => account.key === select.value);
        if (selectedAccount) {
            // dos formas: 
               browser.filterManagerApi.leeFichero(selectedAccount.filterFilePath)
                    .then((contenidoFichero) => pathElement.textContent = contenidoFichero);
  //             browser.filterManagerApi.escribirAlFinal(selectedAccount.filterFilePath,"prueba de escritura");

            // pathElement.textContent = await browser.filterManagerApi.leeFichero(selectedAccount.filterFilePath);
        } else {
            pathElement.textContent = '';
        }
    }

    browser.filterManagerApi.getAccountsInfo().then(accounts => {
        accountsData = accounts;
        selectAccount(sourceSelect, accounts);
        selectAccount(targetSelect, accounts);

        sourceSelect.addEventListener('change', () => updatePath(sourceSelect, sourcePath));
        targetSelect.addEventListener('change', () => updatePath(targetSelect, targetPath));
    }).catch(error => {
        console.error('Error al obtener las cuentas:', error);
    });
});

*/