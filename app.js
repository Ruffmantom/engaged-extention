$(function () {
    let isSuccess = false;
    // load in values from Local Storage
    const startApp = async () => {
        try {
            await loadNotesFromLocalStorage()
            await loadTodosFromLocalStorage()
            await loadPageOptionDataFromLocalStorage()
            isSuccess = true
        } catch (error) {
            // console.log(error)
        }
    }

    startApp()
})