// APP
(function() {
    var indexDisplay = 0,
        selectedIndex = 0,
        arrayInfo = [],
        listjjJson = [],
        zakupy = [],
        lengthNews = 0,
        lengthZakupy = 0;
    
    /**
     * Removes all child of the element.
     * @private
     * @param {Object} elm - The object to be emptied
     * @return {Object} The emptied element
     */
    function emptyElement(elm) {
        while (elm.firstChild) {
            elm.removeChild(elm.firstChild);
        }
        return elm;
    }

    /**
     * Handles the hardware key events.
     * @private
     * @param {Object} event - The object contains data of key event
     */
    function keyEventHandler(event) {
        if (event.keyName === "back") {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    }

    /**
     * Adds a text node with specific class to an element.
     * @private
     * @param {Object} objElm - The target element to be added the text
     * @param {string} textClass - The class to be applied to the text
     * @param {string} textContent - The text string to add
     */
    function addTextElement(objElm, textClass, textContent) {
        var newElm = document.createElement("p");

        newElm.className = textClass;
        newElm.appendChild(document.createTextNode(textContent));
        objElm.appendChild(newElm);
    }

    /**
     * Cuts the text by length and put ellipsis marks at the end if needed.
     * @private
     * @param {string} text - The original string to be cut
     * @param {number} maxLength - The maximum length of the string
     */
    function trimText(text, maxLength) {
        var trimmedString;

        if (text.length > maxLength) {
            trimmedString = text.substring(0, maxLength - 3) + "...";
        } else {
            trimmedString = text;
        }

        return trimmedString;
    }

    /**
     * Displays a news and page number of the selected index.
     * @private
     * @param {number} index - The index of the news to be displayed
     */
    function showNews(index) {
        var objPagenum = document.querySelector("#area-pagenum");
        var objNews = document.querySelector("#area-news");

        emptyElement(objNews);
        var infoObj = arrayInfo[index];
        var infoTitle = Object.keys(infoObj);
        
        if (infoTitle == 'listjj_json') {  // special treatment for zakupy
            objNews.innerHTML = 'listjj....';
            listjjJson = arrayInfo[index][infoTitle];
            zakupy = [];
            for (i = 0; i < listjjJson.length; i++) {
                if (listjjJson[i].category == 'zakupy') {
                    listjjJson[i].selected = false;
                    zakupy.push(listjjJson[i]);
                }
            }
            lengthZakupy = zakupy.length;
            if(lengthZakupy == 0) {
                objNews.innerHTML = 'Empty';
            }
            else {
                zakupy[selectedIndex].selected = true;
                zakupyHtml = '';
                for (i = 0; i < lengthZakupy; i++) {
                    if (i == selectedIndex) {
                        zakupyHtml += '> ';
                    }
                    zakupyHtml += '<font size=5>' + zakupy[i].description + '</font><br />';
                }
                objNews.innerHTML = zakupyHtml;
            }
        }
        else {
            objNews.innerHTML = arrayInfo[index][infoTitle];
        }

        emptyElement(objPagenum);
        addTextElement(objPagenum, "pagenum", "Page " + (index + 1) + "/" + lengthNews);
    }

    /**
     * Displays a news of the next index.
     * @private
     */
    function showNextPage() {
        if (indexDisplay+1 < lengthNews > 0) {
            indexDisplay += 1;
            showNews(indexDisplay);
        }
    }
    /**
     * Displays a news of the previous index.
     * @private
     */
    function showPrevPage() {
        if (indexDisplay > 0 && lengthNews > 0) {
            indexDisplay -= 1;
            showNews(indexDisplay);
        }
    }

    /**
     * On zakupy list change selected item
     * @private
     */
     function changeSelected() {
        selectedIndex += 1;
        if (selectedIndex >= lengthZakupy) {
            selectedIndex = 0;
        }
        showNews(indexDisplay);
    }


     function deleteHandler() {
    	 deleteSelected(LISTJJ_ADDRESS_INTERNAL);
     }
    /**
     * Send POST request to delete selected item
     */
     function deleteSelected(url) {
        if (lengthZakupy == 0) {
            return;
        }
        var connectionInfo = document.getElementById("connectionInfo");
        var selectedId = zakupy[selectedIndex]["id"];
        var xhr = new XMLHttpRequest();

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Authorization', 'ApiKey e5c68304-8374-47f6-b334-1e24fdba4ec7');
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status != 200) {
                    if (url == LISTJJ_ADDRESS_EXTERNAL) {
                    	connectionInfo.textContent = 'Problem...';
                        return true;
                    }
                    connectionInfo.textContent = '1st conn failed, Using other address';
                    deleteSelected(LISTJJ_ADDRESS_EXTERNAL);
                    return true;
                }
                connectionInfo.textContent = this.responseText;
            }
            if (this.responseText == "Deleted." || this.responseText == "Item not found.") {  // remove from downloaded list for quick screen update
                for (i = 0; i < listjjJson.length; i++) { 
                    if (listjjJson[i].id == selectedId) {
                        listjjJson.splice(i, 1);
                    }
                }
                selectedIndex = 0;
                showNews(indexDisplay);
            }
        }
        xhr.send(JSON.stringify({id: selectedId}));
     }

    function getDataFromJson(url) {
        arrayInfo = [];
        var xhr = new XMLHttpRequest();
        var connectionInfo = document.getElementById("connectionInfo");
        connectionInfo.textContent = 'Connecting...';
        xhr.open('GET', url, true, HTTP_USER, HTTP_PASSWORD);
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                
                if (this.status != 200) {
                    if (url == JSON_ADDRESS_INTERNAL) {
                    	connectionInfo.textContent = 'Problem...';
                        return true;
                    }
                    connectionInfo.textContent = '1st conn failed, Using other address';
                    getDataFromJson(JSON_ADDRESS_INTERNAL);
                    return true;
                }

                connectionInfo.textContent = 'Connection ok';
                
                var jsonArray = JSON.parse(this.responseText);
                arrayInfo.push({mitempjj_html: jsonArray['mitempjj_html']});
                arrayInfo.push({listjj_json: jsonArray['listjj_json']});
                arrayInfo.push({news_html: jsonArray['news_html']});
                arrayInfo.push({data_and_uptime: jsonArray['data_and_uptime']});
                lengthNews = arrayInfo.length
                showNews(indexDisplay);
            }
        }
        xhr.send();
    };
    
    function getDataFromJson2(url) {
        arrayInfo = [];
        var xhr = new XMLHttpRequest();
        var connectionInfo = document.getElementById("connectionInfo");
        connectionInfo.textContent = 'Connecting...';
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                
                if (this.status != 200) {
                    if (url == LISTJJ_ADDRESS_INTERNAL_GET) {
                    	connectionInfo.textContent = 'Problem...';
                        return true;
                    }
                    connectionInfo.textContent = '1st conn failed, Using other address';
                    getDataFromJson2(LISTJJ_ADDRESS_INTERNAL_GET);
                    return true;
                }

                connectionInfo.textContent = 'Connection ok';
                
                var jsonArray = JSON.parse(this.responseText);
                jsonArray = JSON.parse(jsonArray['Description']);
                console.log(jsonArray);
                arrayInfo.push({mitempjj_html: jsonArray['mitempjj_html']});
                arrayInfo.push({listjj_json: jsonArray['listjj_json']});
                arrayInfo.push({news_html: jsonArray['news_html']});
                arrayInfo.push({data_and_uptime: jsonArray['data_and_uptime']});
                lengthNews = arrayInfo.length
                showNews(indexDisplay);
            }
        }
        xhr.send();
    };

 
    /**
     * Sets default event listeners.
     * @private
     */
    function setDefaultEvents() {
    	document.getElementById('main').setAttribute('tizen-circular-scrollbar', ''); //round scroll bar instead od vertical
        document.addEventListener("tizenhwkey", keyEventHandler);
        document.querySelector("#header").addEventListener("click", init);
        document.querySelector("#nextControlOverlap").addEventListener("click", showNextPage);
        document.querySelector("#previousControlOverlap").addEventListener("click", showPrevPage);
        document.querySelector("#changeSelectedOverlap").addEventListener("click", changeSelected);
        document.querySelector("#footer").addEventListener("click", deleteHandler);
        document.addEventListener('rotarydetent', rotaryDetentHandler);
    }
    
    /**
     * Vertical page scrolling with bezel
     */ 
	function rotaryDetentHandler (e) {
	    var direction = e.detail.direction,
	    	page = document.getElementById('main');
	    
		if (direction === "CW") {
			page.scrollTop += 70;
		} 
		else if (direction === "CCW") {
			page.scrollTop -= 70;
		}
	}
    
    /**
     * Initiates the application.
     * @private
     */
    function init() {
    	setDefaultEvents();
        //getDataFromJson(JSON_ADDRESS_EXTERNAL);
        getDataFromJson2(LISTJJ_ADDRESS_EXTERNAL_GET);
    }

    window.onload = init;
}());

