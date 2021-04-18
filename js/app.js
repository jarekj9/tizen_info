
(function() {
    var MSG_ERR_NODATA = "There is no data",
        MSG_ERR_NOTCONNECTED = "Connection failed.",
        NUM_MAX_NEWS = 100,
        NUM_MAX_LENGTH_SUBJECT = 9999;
        indexDisplay = 0,
        arrayNews = [],
        lengthNews = 0;
    
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
        objNews.innerHTML = arrayNews[index].title;
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
     * Reads data from internet by XMLHttpRequest, and store received data to the local array.
     */
    function getDataFromXML(url) {
        var xmlDoc,
            i,
            xhr = new XMLHttpRequest(),
            connectionInfo = document.getElementById("connectionInfo"),
            dataItem = null,
            objNews = document.querySelector("#area-news");

        arrayNews = [];
        connectionInfo.textContent = 'Connecting...';
        emptyElement(objNews);
        console.log(arrayNews);
        xhr.open('GET', url, true, HTTP_USER, HTTP_PASSWORD);
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
    
                if (this.status != 200) {
                    objNews.textContent += 'Connection Error: ' + this.status + '. ';
                    if (url == XML_ADDRESS_INTERNAL) {
                        return true;
                    }
                    getDataFromXML(XML_ADDRESS_INTERNAL);
                }
                connectionInfo.textContent = 'Connection ok';
                xmlDoc = xhr.responseXML;
                dataItem = xmlDoc.getElementsByTagName("item");
                console.log(arrayNews);
                if (dataItem.length > 0) {
                    
                    lengthNews = (dataItem.length > NUM_MAX_NEWS) ? NUM_MAX_NEWS : dataItem.length;
                    for (i = 0; i < lengthNews; i++) {
                        arrayNews.push({
                            title: dataItem[i].getElementsByTagName("title")[0].childNodes[0].nodeValue,
                        });
                        arrayNews[i].title = trimText(arrayNews[i].title, NUM_MAX_LENGTH_SUBJECT);
                    }
                    showNews(indexDisplay);
                } 
                else {
                    addTextElement(objNews, "subject", MSG_ERR_NODATA);
                }

            } 
        }
        xhr.send();
    }

 
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
    	getDataFromXML(XML_ADDRESS_EXTERNAL); 
    }

    window.onload = init;
}());

