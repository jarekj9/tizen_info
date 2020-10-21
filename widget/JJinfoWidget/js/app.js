
(function() {
    /**
     * Handles the back key event
     * @private
     */
    function keyEventHandler(event) {
        if (event.keyName === "back") {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    }

    function getDataFromNetwork(url) {
        var xhr = new XMLHttpRequest();
        var contents = document.getElementById("mainInfo");
        var connectionInfo = document.getElementById("connectionInfo");
        connectionInfo.textContent = 'Connecting...';
        xhr.open('GET', url, true, HTTP_USER, HTTP_PASSWORD);
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                	connectionInfo.textContent = 'Connection ok';
                    contents.textContent = 'LIST: ' + this.responseText;
                }
                else {
                    contents.textContent += 'Server did not respond...';
                    if (url == XML_ADDRESS_INTERNAL) {
                        return true;
                    }
                    getDataFromNetwork(XML_ADDRESS_INTERNAL);
                }
            }  
        }
        xhr.send();
    };

    /**
     * Initializes the application
     * @private
     */
    function init() {
        var contents = document.getElementById("mainInfo");
        getDataFromNetwork(XML_ADDRESS_EXTERNAL);
        document.getElementById('header').addEventListener('click', init);
    }

    window.onload = init();
}());
