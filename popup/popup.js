document.addEventListener('DOMContentLoaded', () => {
  const sourceSelect = document.getElementById('source-account');
  const targetSelect = document.getElementById('target-account');

  function populateSelect(select, accounts) {
      accounts.forEach(account => {
          const option = document.createElement('option');
          option.value = account.key;
          option.textContent = `${account.name}`;
          option.title = account.filterFilePath;
          select.appendChild(option);
      });
  }

  browser.filterManagerApi.getAccountsInfo().then(accounts => {
      populateSelect(sourceSelect, accounts);
      populateSelect(targetSelect, accounts);
  }).catch(error => {
      console.error('Error al obtener las cuentas:', error);
  });
});


/*
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

*/