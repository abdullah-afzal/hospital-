const { ipcRenderer } = require('electron');

function openAdminPanel() {
  ipcRenderer.send('open-admin-panel');
}

function openReceptionistPanel() {
  ipcRenderer.send('open-receptionist-panel');
}
