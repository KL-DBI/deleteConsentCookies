chrome.action.onClicked.addListener(async (tab) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        var tabURL = tab.url;
        
        // Récupère la liste des cookies à supprimer depuis le fichier texte
        fetch(chrome.runtime.getURL('cookies.txt'))
            .then(response => response.text())
            .then(data => {
                // Divise le contenu du fichier texte en un tableau de lignes
                var cookies = data.split('\n');
                // Supprime chaque cookie répertorié pour le domaine spécifié
                cookies.forEach(function(cookieName) {
                    var trimmedCookieName = cookieName.trim();
                    chrome.scripting.executeScript({ 
                        target : {tabId : tab.id, allFrames : true},
                        func : removeFromLocalStorage,
                        args : [ trimmedCookieName ]
                    }).then(()=> console.log("injected a function on : " + tab.id));
                    // Vérifie si le cookie est présent
                    chrome.cookies.getAll({url: tabURL}, function(cookies) {
                        cookies.forEach(function(cookie) {
                            if (cookie.name.startsWith(trimmedCookieName)) {
                                // Si le cookie est présent, le supprime
                                chrome.cookies.remove({url: tabURL, name: cookie.name}, function(deletedCookie) {
                                    console.log('Cookie "' + cookie.name + '" supprimé pour le domaine : ' + tabURL);
                                });
                            } 
                        });
                    });

                     // Recharge la page après avoir supprimé les cookies
                    chrome.tabs.reload(tab.id);
                });
            });
    });
  });
  

  function removeFromLocalStorage(trimmedCookieName){
    // Supprime la clé correspondant au nom du cookie du localStorage
    localStorage.removeItem(trimmedCookieName);
}