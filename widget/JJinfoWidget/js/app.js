
(function() {
	
    /**
     * Launches the world clock application
     * @private
     */
    function launchApp(){
        var app = window.tizen.application.getCurrentApplication();
        var appId = app.appInfo.id.substring(0, (app.appInfo.id.lastIndexOf('.')) );
        window.tizen.application.launch(appId);
    }

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

    function getDataFromNetwork(file, handler) {
        var xhr = new XMLHttpRequest();
        
        xhr.open('GET', file, true, HTTP_USER, HTTP_PASSWORD);
        //xhr.open('GET', file, true);
        xhr.onreadystatechange = handler;
        xhr.onload = function() {
            if (this.status == 200) {
                /* Handle the response */
            }
        };
        xhr.send();
    }
    
    /* If getting Text data */
    function handleResponseTEXT(e) {
        if (e.target.readyState == 4) {
            if (e.target.status == 200) {
                var contents = document.getElementById("area-news");
                contents.textContent = e.target.responseText;
            } else {
                /* Error handling */
            }
        }
    }

    /**
     * Initializes the application
     * @private
     */
    function init() {
        
        //getDataFromNetwork('http://192.168.31.27/infoJJ_testJJinfo_widget.txt', handleResponseTEXT);
        getDataFromNetwork(XML_ADDRESS_EXTERNAL, handleResponseTEXT);
        document.getElementById('area-news').addEventListener('click', init);

        pageNoList.addEventListener('click', launchApp);
        document.getElementById('city-toggle').addEventListener('click', toggle);
        window.addEventListener('tizenhwkey', keyEventHandler);
    }

    window.onload = init();
}());
