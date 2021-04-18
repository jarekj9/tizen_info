
(function() {
    var indexDisplay = 0,
        defaultIndex = 0,
        defaultCategory = 'zakupy',
        nrOfPages = 0,
        pageArray = [];


    /**
     * Handles the back key event
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
                if (this.status != 200) {
                	connectionInfo.textContent = 'Connection broken';
                    contents.textContent += 'Connection Error: ' + this.status + '. ';
                    if (url == XML_ADDRESS_INTERNAL) {
                        return true;
                    }
                    getDataFromNetwork(XML_ADDRESS_INTERNAL);
                }
                connectionInfo.textContent = 'Connection ok';
                var jsonData = JSON.parse(this.responseText);
                parseJson(jsonData);
                showPage(defaultIndex);
            }  
        };
        xhr.send();
    };


    function jsonToArrayOfObjects(jsonData) {
        pageArray = [];
        var i = 0;
        Object.keys(jsonData).forEach(function(item) {
            var obj = {};
            obj[item] = jsonData[item];
            pageArray.push(obj);
            if (item == defaultCategory) {
                defaultIndex = i;
            }
            i++;
        });
        return pageArray;
    }


    /**
     * Displays a page of the next index.
     */
    function showNextPage() {
        if (indexDisplay+1 < nrOfPages > 0) {
            indexDisplay += 1;
            showPage(indexDisplay);
        }
    }
    /**
     * Displays a page of the previous index.
     */
    function showPrevPage() {
        if (indexDisplay > 0 && nrOfPages > 0) {
            indexDisplay -= 1;
            showPage(indexDisplay);
        }
    }

    function parseJson(jsonData) {
        arrayData = jsonToArrayOfObjects(jsonData);
        nrOfPages = arrayData.length;
    }

    function showPage(index) {
        var category = document.getElementById("category");
        var contents = document.getElementById("mainInfo");
        var key = Object.keys(pageArray[index])[0];
        category.textContent = key+':';
        contents.textContent = pageArray[index][key].join(', ');
    }
  
    function openApp() { 	
    	tizen.application.launch("AHEoORjcl3.JJinfo");
    }

    function setDefaultEvents() {
        document.getElementById("nextControlOverlap").addEventListener("click", showNextPage);
        document.getElementById("previousControlOverlap").addEventListener("click", showPrevPage);
        document.getElementById('header').addEventListener('click', init);
        //document.getElementById('header').addEventListener('contents', init);
        document.querySelector("#contents").addEventListener("click", openApp);
    }

    /**
     * Initializes the application
     */
    function init() {
        var contents = document.getElementById("mainInfo");
        getDataFromNetwork(XML_ADDRESS_EXTERNAL);
        setDefaultEvents();
    }

    window.onload = init();
}());
