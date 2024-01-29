$(() => {
    // settings are established when the user changes them
    // need to load in settings on load.
    if (global_app_data.e_settings) {
        // if present then load
        // let loadedSettings = JSON.parse(localStorage.getItem(TF_SETTINGS))
        // set current settings
        
        // set setting checkboxes
        
    }

    // setting button actions
    $(settingsBtn).on('click', () => {
        console.log("opening settings and adding class: modal_active")
        // if ($(settingsModalCont).hasClass("modal_active")) {
        //     $(settingsModalCont).removeClass('modal_active')
        // } else {
            $(settingsModalCont).addClass('modal_active')
            // handle menu
            closeMenu()
        // }
    })
    // close settings modal
    $(closeBtn).on('click', () => {
        if ($(settingsModalCont).hasClass("modal_active")) {
            $(settingsModalCont).removeClass('modal_active')

        }
    })

    $(clearAllSettingsBtn).on('click', (e) => {
        e.preventDefault()
        localStorage.removeItem("engage_app_data")
        location.reload();
    })

    
})


