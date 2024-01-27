 //init tab array
 const tabElmArr = Array.from(tabElm);
 const tabBtnArr = Array.from(tabNavBtnElm);

 // load current tab
 const loadTab = () => {
    // remove class from all btns
    removeClass(tabBtnArr, 'nav_tab_active')
    // loop though buttons and activate one that matches local data
    try {
        tabBtnArr.forEach((btn) => {
            $(btn).data('tab') === global_app_data.e_tab ? $(btn).addClass('nav_tab_active') : ''
        })
        // loop through the tab elements and display
        // the one that matches local data
        tabElmArr.forEach(tab => {
            // remove active from tab
            // add class to clicked id
            $(tab).data('tab') !== global_app_data.e_tab ? $(tab).removeClass('tab_active') : $(tab).addClass('tab_active')
        })
    } catch (error) {
        // set the first tab
        $(tabBtnArr[0]).addClass('nav_tab_active')
        $(tabElmArr[0]).addClass('tab_active')
    }
}



$(function () {
    // load tabs
    loadTab()
    // hiding or showing tabs
    tabBtnArr.forEach((btn) => {
        $(btn).click((e) => {
            let tabId = $(e.target).data('tab')
            // save current tab to local storage
            global_app_data.e_tab = tabId
            saveToLocalStorage()
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

    $(menuBtnElm).on('click', () => {
        if (menuIsOpen) {
            // close menu
            closeMenu()
        } else {
            // open menu
            $(".menu_sidebar").addClass("menu_open")
            // add class to menu button
            $(menuBtnElm).parent().addClass('menu_btn_active')
            menuIsOpen = true
        }

        // close menu when clicking off of it
        $(document).on("click", function (event) {
            // Check if the click event target is not within the menu
            if (!$(".menu_sidebar").is(event.target) && menuIsOpen && !menuBtnElm.is(event.target) && $(".menu_sidebar").has(event.target).length === 0) {
                // close menu
                closeMenu()
            }
        });
    })

    // end of Doc Ready
});
