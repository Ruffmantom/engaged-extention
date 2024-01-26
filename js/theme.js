// set items for dark mode
const setItemsToDark = () => {
    // if checked then turn to dark mode
    // set icon
    $(moonIcon).addClass('theme_set')
    $(darkRadio).attr({ "checked": true })
    // false = dark theme
    global_app_data.engage_theme = false
    saveToLocalStorage()
    // reset Light mode
    $(sunIcon).removeClass('theme_set')
    $(lightRadio).attr({ "checked": false })
}

// set items for light mode
const setItemsToLight = () => {
    // set to light mode
    $(sunIcon).addClass('theme_set')
    $(lightRadio).attr({ "checked": true })
    // true = light theme
    global_app_data.engage_theme = true
    saveToLocalStorage()
    // remove moon
    $(moonIcon).removeClass('theme_set')
    $(darkRadio).attr({ "checked": false })
}

// load theme
const loadTheme = () => {
    // set local Storage
    if (global_app_data.engage_theme) {
        setItemsToLight()
    } else {
        setItemsToDark()
    }
}

$(function () {
    // this file is specifically for controlling the theme
    themeBtn.on('click', (e) => {
        // check to see if is already active
        if (lightRadio.attr('checked')) {
            setItemsToDark()
        } else {
            setItemsToLight()
        }
    })
    // load theme on load
    loadTheme()
    // end of doc ready
})