const initApp = () => {
    // Check for engage_app_data in local storage
    const storedData = localStorage.getItem('engage_app_data');
    // Assuming global_app_data and global_app_default_data are already defined
    if (storedData) {
        // Assign stored data to global_app_data if it exists and is not null/undefined
        global_app_data = JSON.parse(storedData);
    } else {
        // If null or undefined, set local storage with default data and update global_app_data
        localStorage.setItem('engage_app_data', JSON.stringify(global_app_default_data));
        global_app_data = global_app_default_data;
    }
};

// Ensure global_app_data and global_app_default_data are defined outside this function
const startApp = async () => {
    initApp()

    await loadNotesFromLocalStorage()
    await loadTodosFromLocalStorage()
    await loadPageOptionDataFromLocalStorage()

}

$(function () {
    startApp()
})