$(() => {
    // settings are established when the user changes them
    // need to load in settings on load.
    if (localStorage.getItem(TF_SETTINGS)) {
        // if present then load
        let loadedSettings = JSON.parse(localStorage.getItem(TF_SETTINGS))
        // set current settings
        
        // set setting checkboxes
        
    }

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


