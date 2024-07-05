console.log("Popup script LOADER");

document.addEventListener('DOMContentLoaded', async function() {
  try {
    const accounts = await messenger.accounts.list();
    const accountList = document.getElementById('accountList');
    
    if (accounts.length === 0) {
      accountList.textContent = "No se encontraron cuentas.";
    } else {
      accounts.forEach(account => {
        const li = document.createElement('li');
        li.textContent = `${account.name} (${account.id})`;
        accountList.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Error al obtener las cuentas:', error);
    const accountList = document.getElementById('accountList');
    accountList.textContent = "Error al obtener las cuentas: " + error.message;
  }
});
