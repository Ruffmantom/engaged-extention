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
        localStorage.removeItem("DATA_NAME")
        localStorage.removeItem("TF_SETTINGS")
        localStorage.removeItem("TF_NOTES")
        localStorage.removeItem("TF_N_S")
        localStorage.removeItem("TF_TODOS")
        localStorage.removeItem("TF_DATA")
        localStorage.removeItem("TF_PO_DATA")
        location.reload();
    })

    
})


