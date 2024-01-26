$(function () {
    //init tab array
    const tabElmArr = Array.from(tabElm);
    const tabBtnArr = Array.from(tabNavBtnElm);
    // click tab functionality
    const removeClass = (elmArr, className) => {
        elmArr.forEach(elm => {
            $(elm).removeClass(className)
        })
    }

    // load current tab
    const loadTab = () => {
        // remove class from all btns
        removeClass(tabBtnArr, 'nav_tab_active')
        // loop though buttons and activate one that matches local data
        try {
            tabBtnArr.forEach((btn) => {
                $(btn).data('tab') === globalValues.currentTab ? $(btn).addClass('nav_tab_active') : ''
            })
            // loop through the tab elements and display
            // the one that matches local data
            tabElmArr.forEach(tab => {
                // remove active from tab
                // add class to clicked id
                $(tab).data('tab') !== globalValues.currentTab ? $(tab).removeClass('tab_active') : $(tab).addClass('tab_active')
            })
        } catch (error) {
            // set the first tab
            $(tabBtnArr[0]).addClass('nav_tab_active')
            $(tabElmArr[0]).addClass('tab_active')
        }
        

    }
    // load tabs
    loadTab()
    // hiding or showing tabs
    tabBtnArr.forEach((btn) => {
        $(btn).click((e) => {
            let tabId = $(e.target).data('tab')
            // save current tab to local storage
            globalValues.currentTab = tabId
            saveToLocalStorage(DATA_NAME, globalValues)
            // remove class from all btns
            removeClass(tabBtnArr, 'nav_tab_active')
            // add active from nav Btn
            $(e.target).addClass('nav_tab_active')

            // handle menu if open
            closeMenu()

            tabElmArr.forEach(tab => {
                // remove active from tab
                // add class to clicked id
                $(tab).data('tab') !== tabId ? $(tab).removeClass('tab_active') : $(tab).addClass('tab_active')
            })
        })
    })
    // **** Actions ****
    // copy button for upper text box.
    // $(copyUpperTextBtn).on('click', (e) => {
    //     copyFunction(e, "copy_upper_txt_btn", "#text_input")
    // })
    // when click on or when text_input is active select all
    // $(textInput).on('click', () => {
    //     $(textInput).select();
    // })
    
    // copy function
    const copyFunction = (e, element, copyElm) => {
        // console.log("Clicked " + element + " and about to copy: " + copyElm)
        if (e && $(copyElm).val() !== "") {
            $(copyElm).select();
            document.execCommand("copy");
            sendNotification('', 5000, 'Copied!')
        }
    }

    // setting button actions
    $(settingsBtn).on('click', () => {
        if ($(settingsModalCont).hasClass("modal_active")) {
            $(settingsModalCont).removeClass('modal_active')
        } else {
            $(settingsModalCont).addClass('modal_active')
            // handle menu
            closeMenu()
        }
    })
    $(closeBtn).on('click', () => {
        if ($(settingsModalCont).hasClass("modal_active")) {
            $(settingsModalCont).removeClass('modal_active')

        }
    })

    menuBtnElm.on('click', () => {
        if (menuIsOpen) {
            // close menu
            // close menu
            closeMenu()
        } else {
            // open menu
            $(".menu_sidebar").addClass("menu_open")
            // add class to menu button
            $(menuBtnElm).parent().addClass('menu_btn_active')
            menuIsOpen = true
        }

        // close todo list menu
        $(document).on("click", function (event) {
            // Check if the click event target is not within the menu
            if (!$(".menu_sidebar").is(event.target) && menuIsOpen && !menuBtnElm.is(event.target) && $(".menu_sidebar").has(event.target).length === 0) {
                // close menu
                closeMenu()
            }
        });
    })

    const closeMenu = () => {
        if (menuIsOpen) {
            $(".menu_sidebar").removeClass("menu_open")
            // remove class to menu button
            $(menuBtnElm).parent().removeClass('menu_btn_active')
            menuIsOpen = false
        }
    }
    // open the todo list menu


    // end of Doc Ready
});
