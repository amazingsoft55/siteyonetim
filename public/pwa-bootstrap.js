(function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function () {});
  }
  window.__deferredPwaInstall = null;
  window.__pwaInstallListeners = [];
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    window.__deferredPwaInstall = e;
    var list = window.__pwaInstallListeners || [];
    for (var i = 0; i < list.length; i++) {
      try {
        list[i](e);
      } catch (x) {}
    }
  });
})();
