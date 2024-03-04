/**
var updateObj = {
    acknowledged:false,
    content:"HTML_AS_STRING_HERE",
    version:"",
    id:"",
}


e_settings: {
        // put settings here
        enable_update_notifications: true,
    },

 */
const initUpdates = () => {
    if (global_app_data.e_updates === null || global_app_data.e_updates === undefined) {
        // create variable
        global_app_data.e_updates = []
    }

    // check if settings allow for popup
    if (global_app_data.e_settings.enable_update_notifications === null || global_app_data.e_settings.enable_update_notifications === undefined) {
        // create variable
        global_app_data.e_settings.enable_update_notifications = true
    }
    // add any new updates to global
    global_app_data.e_updates = app_updates.map(u => ({ ...u }))
    // save to local
    saveToLocalStorage()
}

const renderUpdates = () => {
    $("#updates_cont").text("")
    if (global_app_data.e_settings.enable_update_notifications) {
        // show latest update
        let latestUpdate = findMostRecentUpDate(global_app_data.e_updates)
        if (!latestUpdate.acknowledged) {
            $("#updates_cont").append(latestUpdate.content)
        }
    }
    $("#show_updates_modal").addClass("modal_active")
}

$(() => {
    // init modal
    // check if user has variable
    initUpdates()
    renderUpdates()


})