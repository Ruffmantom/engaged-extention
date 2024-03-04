// create updates if not there
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
    // First, create a Set of existing IDs for faster lookup
    const existingIds = new Set(global_app_data.e_updates.map(u => u.id));
    // Filter out new updates from app_updates where the id does not exist in existingIds
    const newUpdates = app_updates.filter(u => !existingIds.has(u.id));
    // Now, add these new updates to global_app_data.e_updates
    global_app_data.e_updates = [...global_app_data.e_updates, ...newUpdates.map(u => ({ ...u }))];
    
    // save to local
    saveToLocalStorage()
}
// render modal
const renderUpdates = () => {
    $("#updates_cont").text("")
    // check settings first
    if (global_app_data.e_settings.enable_update_notifications) {
        // show latest update
        latestUpdate = findMostRecentUpDate(global_app_data.e_updates)
        // check if update has been acknowledged
        if (!latestUpdate.acknowledged) {
            $("#updates_cont").append(latestUpdate.content)
            $("#show_updates_modal").addClass("modal_active")
        }
    }
}

$(() => {
    // init updates
    initUpdates()
    renderUpdates()

    // close and acknowledge
    close_updates_modal_btn.on('click', (e) => {
        e.preventDefault()
        $("#show_updates_modal").removeClass("modal_active")
        // find update
        global_app_data.e_updates.forEach(u => {
            if (u.id === latestUpdate.id) {
                u.acknowledged = true
            }
        });

        // save to local
        saveToLocalStorage()
    })
})