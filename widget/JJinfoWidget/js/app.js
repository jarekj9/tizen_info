// WIDGET
(function() {
    var indexDisplay = 0,
        defaultIndex = 0,
        nrOfPages = 0,
        defaultCategory = "zakupy",
        listjjJson = [],
        categories = [];


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
        
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status != 200) {         // this never happens since some time
                	connectionInfo.textContent = 'Connection broken';
                    contents.textContent += 'Connection Error: ' + this.status + url;
                    if (url == JSON_ADDRESS_INTERNAL) {
                        return true;
                    }
                    return getDataFromNetwork(JSON_ADDRESS_INTERNAL);
                }
                if (this.responseText == "") {  // On external address I get empty response instead of status != 200, not sure why
                	connectionInfo.textContent = 'Empty response text';
                	if (url == JSON_ADDRESS_INTERNAL) {
                        return true;
                    }
                    return getDataFromNetwork(JSON_ADDRESS_INTERNAL);
                }
                else {
                	connectionInfo.textContent = 'Connection ok';
                
                var jsonData = JSON.parse(this.responseText);
                jsonData = JSON.parse(jsonData['Description']);
                parseJson(jsonData['listjj_json']);
                showPage(defaultIndex);
                }
            }  
        };
        xhr.open('GET', url, true);
        xhr.send();
    };

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
        categories = [];
        for(var x=0; x<jsonData.length; x++) {
            if(!categories.includes(jsonData[x].category)) {
                categories.push(jsonData[x].category);
            }
        }
        nrOfPages = categories.length;
        listjjJson = jsonData;
        defaultIndex = categories.indexOf(defaultCategory);
    }

    function showPage(index) {
        var category = document.getElementById("category");
        var contents = document.getElementById("mainInfo");
        category.textContent = categories[index];
        var currentContent = "";
        for(var x=0; x<listjjJson.length; x++) {
            if (listjjJson[x].category == categories[index]) {
                currentContent += listjjJson[x].description + ", ";
            }
        }
        currentContent = currentContent.slice(0, -2); 
        contents.innerHTML = currentContent;
    }
  
    function openApp() { 	
    	tizen.application.launch("AHEoORjcl3.JJinfo");
    }

    function setDefaultEvents() {
        document.getElementById("nextControlOverlap").addEventListener("click", showNextPage);
        document.getElementById("previousControlOverlap").addEventListener("click", showPrevPage);
        document.getElementById('header').addEventListener('click', init);
        document.querySelector("#contents").addEventListener("click", openApp);
    }

    /**
     * Initializes the application
     */
    function init() {
        getDataFromNetwork(JSON_ADDRESS_EXTERNAL);
        setDefaultEvents();
    }

    window.onload = init();
}());
