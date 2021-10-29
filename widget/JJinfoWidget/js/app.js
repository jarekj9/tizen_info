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
        xhr.open('GET', url, true, HTTP_USER, HTTP_PASSWORD);
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status != 200) {
                	connectionInfo.textContent = 'Connection broken';
                    contents.textContent += 'Connection Error: ' + this.status + '. ';
                    if (url == JSON_ADDRESS_INTERNAL) {
                        return true;
                    }
                    getDataFromNetwork(JSON_ADDRESS_INTERNAL);
                }
                connectionInfo.textContent = 'Connection ok';
                var jsonData = JSON.parse(this.responseText);
                parseJson(jsonData['listjj_json']);
                showPage(defaultIndex);
            }  
        };
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
        console.log(categories);
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
        //document.getElementById('header').addEventListener('contents', init);
        document.querySelector("#contents").addEventListener("click", openApp);
    }

    /**
     * Initializes the application
     */
    function init() {
        var contents = document.getElementById("mainInfo");
        getDataFromNetwork(JSON_ADDRESS_EXTERNAL);
        setDefaultEvents();
    }

    window.onload = init();
}());
