const createId = () => {
    let newId = "";
    for (var i = 0; i < 6; i++) {
        newId += idChars[Math.floor(Math.random() * idChars.length)];
    }
    newId += "-"
    for (var i = 0; i < 6; i++) {
        newId += idChars[Math.floor(Math.random() * idChars.length)];
    }
    newId += "-"
    for (var i = 0; i < 6; i++) {
        newId += idChars[Math.floor(Math.random() * idChars.length)];
    }
    return newId;
};
// format date from date picker
function formatDate(inputDate) {
    // Parse the input date string into a Date object
    const dateObject = new Date(inputDate);

    // Extract year, month, and day
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = dateObject.getDate().toString().padStart(2, '0');

    // Format the date as "month/day/year"
    const formattedDate = `${month}/${parseInt(day) + 1}/${year}`;

    return formattedDate;
}

// create date helper
const createDate = () => {
    return new Date().toLocaleString();
}

//notification
const sendNotification = (slideSpeed, time, text) => {
    $(".notification").text('');
    $(".notification").text(text);
    $(".notification").slideDown(slideSpeed);
    let timer = setTimeout(() => {
        $(".notification").slideUp(slideSpeed);
        clearTimeout(timer)
    }, time);
}
// Save to local storage
const saveToLocalStorage = () => {
    localStorage.setItem('engage_app_data', JSON.stringify(global_app_data));
};


function findAndReplaceLinks(text) {
    // Regular expression to find URLs
    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*\b/g;
    // Replace URLs with anchor tags
    const textWithLinks = text.replace(urlRegex, (url) => {
        let a = url.split("//")[1]
        let name = a.split('/')[0]

        return `<a class="note_text_link" href="${url}" target="_blank">
        ${name} 
        
        </a>`;
    });

    return textWithLinks;
}


// copy function
const copyFunction = (element) => {
    if ($(element).val() !== "") {
        // console.log('copy value: ' + $(element).val())
        $(element).select();
        document.execCommand("copy");
        sendNotification('', 5000, 'Copied!')
    }
}
// closes navigation menu
const closeMenu = () => {
    if (menuIsOpen) {
        $(".menu_sidebar").removeClass("menu_open")
        // remove class to menu button
        $(menuBtnElm).parent().removeClass('menu_btn_active')
        menuIsOpen = false
    }
}
// remove a class from an array of similar elements
const removeClass = (elmArr, className) => {
    elmArr.forEach(elm => {
        $(elm).removeClass(className)
    })
}

// see if a color is light or dark
function isColorLight(hex) {
    // Convert hex to RGB
    const red = parseInt(hex.slice(1, 3), 16);
    const green = parseInt(hex.slice(3, 5), 16);
    const blue = parseInt(hex.slice(5, 7), 16);

    // Calculate luminance
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

    // Normalized against 255
    const normalizedLuminance = luminance / 255;

    // Determine if the color is light or dark
    return normalizedLuminance > 0.5;
}

// return name without hash
const returnColorName = (hex) => {
    if (hex !== "" || hex !== null) {
        let a = hex.split('#')
        return a[1]
    }
}

const findColorName = (hex) => {
    let foundColorName = ""
    colorLib.find(c => {
        if (c.hex === `#${hex}`) {
            foundColorName = c.colorName
        }
    })
    return foundColorName
}