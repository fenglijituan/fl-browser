(function(){
var ELEC;
try { ELEC = require('electron'); } catch(e) { ELEC = null; }
var ipc = ELEC ? ELEC.ipcRenderer : null;
function G(id) { return document.getElementById(id); }
function init() { console.log('init'); }
init();
})();