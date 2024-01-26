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
    // console.log("Clicked " + element + " and about to copy: " + copyElm)
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