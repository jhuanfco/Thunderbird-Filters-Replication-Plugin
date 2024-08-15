
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
               browser.filterManagerApi.escribirAlFinal(selectedAccount.filterFilePath,"prueba de escritura");

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

