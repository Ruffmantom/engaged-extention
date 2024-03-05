$(() => {
    // settings are established when the user changes them
    // need to load in settings on load.
    if (global_app_data) {
        // set current settings
        // set setting checkboxes
        settings_enable_update_notifications.prop('checked', global_app_data.e_settings.enable_update_notifications);
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

    settings_enable_update_notifications.change(function () {
        console.log("checkbox is: ", settings_enable_update_notifications.is(':checked'))
        // change global
        global_app_data.e_settings.enable_update_notifications = settings_enable_update_notifications.is(':checked')
        // save to local
        saveToLocalStorage()
    })


})


