
(function() {
    var XML_METHOD = "GET",
        MSG_ERR_NODATA = "There is no data",
        MSG_ERR_NOTCONNECTED = "Connection aborted. Check your internet connection.",
        NUM_MAX_NEWS = 100,
        NUM_MAX_LENGTH_SUBJECT = 9999,
        arrayNews = [],
        indexDisplay = 0,
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
        var objNews = document.querySelector("#area-news"),
            objPagenum = document.querySelector("#area-pagenum");

        emptyElement(objNews);
        objNews.innerHTML = arrayNews[index].title;
        emptyElement(objPagenum);
        addTextElement(objPagenum, "pagenum", "Page " + (index + 1) + "/" + lengthNews);
    }

    /**
     * Displays a news of the next index.
     * @private
     */
    function showNextNews() {
        if (indexDisplay+1 < lengthNews > 0) {
            indexDisplay += 1;
            showNews(indexDisplay);
        }
    }
    /**
     * Displays a news of the previous index.
     * @private
     */
    function showPrevNews() {
        if (indexDisplay > 0 && lengthNews > 0) {
            indexDisplay -= 1;
            showNews(indexDisplay);
        }
    }

    /**
     * Reads data from internet by XMLHttpRequest, and store received data to the local array.
     * @private
     */
    function getDataFromXML() {
    	
    	xmlhttp = new XMLHttpRequest();
    	
        var objNews = document.querySelector("#area-news"),
            xmlhttp,
            xmlDoc,
            dataItem,
            i;

        arrayNews = [];
        lengthNews = 0;
        indexDisplay = 0;
        emptyElement(objNews);

        xmlhttp.open(XML_METHOD, XML_ADDRESS_EXTERNAL, false, HTTP_USER, HTTP_PASSWORD);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                xmlDoc = xmlhttp.responseXML;
                dataItem = xmlDoc.getElementsByTagName("item");

                if (dataItem.length > 0) {
                    lengthNews = (dataItem.length > NUM_MAX_NEWS) ? NUM_MAX_NEWS : dataItem.length;
                    for (i = 0; i < lengthNews; i++) {
                        arrayNews.push({
                            title: dataItem[i].getElementsByTagName("title")[0].childNodes[0].nodeValue,
                        });
                        arrayNews[i].title = trimText(arrayNews[i].title, NUM_MAX_LENGTH_SUBJECT);
                    }
                    
                    //arrayNews.push({title: 'test1</br>test2</br>test3'}); //add news manually and increase length by 1
                    //lengthNews += 1;
                    showNews(indexDisplay);
                } else {
                    addTextElement(objNews, "subject", MSG_ERR_NODATA);
                }
                
                

                xmlhttp = null;
            } else {
                addTextElement(objNews, "subject", MSG_ERR_NOTCONNECTED);
            }
        };

        xmlhttp.send();
    }

 
    /**
     * Sets default event listeners.
     * @private
     */
    function setDefaultEvents() {
    	document.getElementById('main').setAttribute('tizen-circular-scrollbar', ''); //round scroll bar instead od vertical
    	
        document.addEventListener("tizenhwkey", keyEventHandler);
        document.querySelector("#area-news").addEventListener("click", showNextNews);
        document.querySelector("#area-title").addEventListener("click", showPrevNews);
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
    	getDataFromXML(); 
    }

    window.onload = init;
}());

