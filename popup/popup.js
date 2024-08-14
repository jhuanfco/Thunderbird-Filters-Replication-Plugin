document.addEventListener('DOMContentLoaded', () => {
    const accountsList = document.getElementById('accounts-list');

    // Llama a la función getAccountsInfo y muestra la información
    browser.filterManagerApi.getAccountsInfo().then(accounts => {
        accounts.forEach(account => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${account.name}</span><span class="path">${account.filterFilePath}</span>`;
            accountsList.appendChild(li);
        });
    }).catch(error => {
        console.error('Error al obtener las cuentas:', error);
    });
});

