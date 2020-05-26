(function () {

    "use strict";

    /*helper functions*/
    //get position of where user clicked
    function getPosition(event) {
        var posX = 0;
        var posY = 0;

        if (!event) {
            var event = window.event;
        }

        if (event.pageX || event.pageY) {
            posX = event.pageX;
            posY = event.pageY;
        }
        else if (event.clientX || event.clientY) {
            posX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posX,
            y: posY
        }
    }

    var menuPosition;
    var menuPositionX;
    var menuPositionY;

    //to position the menu on the web page
    function positionMenu(event) {
        menuPosition = getPosition(event);
        menuPositionX = menuPosition.x + "px";
        menuPositionY = menuPosition.y + "px";

        menu.style.left = menuPositionX;
        menu.style.top = menuPositionY;
    }

    //check if user clicked inside the element
    function clickInsideElement(event, className) {
        var element = event.sourceElement || event.target;

        if (element.classList.contains(className)) {
            return element;
        }
        else {
            while (element == element.parentNode) {
                if (element.classList && element.classList.contains(className)) {
                    return element;
                }
            }
        }

        return false;
    }

    /*core functions and variables*/
    var itemImageClassName = "item-img";
    var menu = document.querySelector(".context-menu");
    var menuOn = 0;
    var activeClassName = "context-menu--active";

    //turns the custom context menu on
    function toggleMenuOn() {
        if (menuOn != 1) {
            menuOn = 1;
            menu.classList.add(activeClassName);
        }
    }

    //turns the custom context menu off
    function toggleMenuOff() {
        if (menuOn != 0) {
            menuOn = 0;
            menu.classList.remove(activeClassName);
        }
    }

    //listens for contextmenu events (checks states and deploys context menus)
    function contextListener() {
        document.addEventListener("contextmenu",
            function (event) {
                if (clickInsideElement(event, itemImageClassName)) {
                    event.preventDefault();
                    toggleMenuOn();
                    positionMenu(event);
                }
                else {
                    toggleMenuOff();
                }
            })
    }

    //listens for click events (helps hide the menu when left clicking outside of context)
    function clickListener() {
        document.addEventListener("click",
            function (event) {
                var button = event.which || event.button;
                if (button == 1) {
                    toggleMenuOff();
                }
            })
    }

    //listens for keyupevents (escape key resets the menu)
    function keyupListener() {
        window.onkeyup = function (event) {
            if (event.keyCode == 27) {
                toggleMenuOff();
            }
        }
    }

    function init() {
        contextListener();
        clickListener();
        keyupListener();
    }

    init();
})();