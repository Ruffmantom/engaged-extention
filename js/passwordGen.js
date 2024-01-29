const returnRandomNumber = (length) => {
    return Math.floor(Math.random() * length)
}
const addUpperCase = (word) => {
    // this function will take the word and format it according to if the upper is checked
    // if (global_app_data.e_pass_settings.inc_uppercase) {
    //     let randomIntervals = Math.floor(Math.random() * word.length)
    //     // for (var i = 0 )
    // }
}

const findWordsToFit = (length) => {
    console.log(length)
    let pass = ""
    let filteredWords = wordList.filter(w => {
        return w.length <= length
    })
    // add random words to pass string
    for (var i = 0; i <= filteredWords.length; i++) {
        let randomWord = filteredWords[returnRandomNumber(filteredWords.length)]
        // check if pass length is fulfilled
        if (pass.length + randomWord.length > length) {
            console.log("Pass with words: " + pass)
            return pass
        }
        // if its still less than length then keep iterating
        pass += randomWord + ","
    }
}


const makePassword = (len) => {
    // init returnable password
    let pass = "";
    let genWords = ""
    let genSpecialChars = ""
    let genNumbers = ""
    // check clicked settings
    if ($(pass_gen_setting_readable).is(':checked')) {
        // return words that are less than or equal to length
        console.log("about to generate readable pass")
        let readableWords = findWordsToFit(global_app_data.e_pass_length)
        // check if upper is checked
        if (global_app_data.e_pass_settings.inc_uppercase) {
            let splitReadableWords = readableWords.split(',')
            for (let i = 0; i < splitReadableWords.length; i++) {
                let word = splitReadableWords[i].trim();
                let splitWord = word.split('')
                let capitalizeLetters = returnRandomNumber(splitWord.length)
                for (var ii = 0; ii < capitalizeLetters; ii++) {
                    let randomIndex = returnRandomNumber(splitWord.length);
                    splitWord[randomIndex] = splitWord[randomIndex].toUpperCase()
                }
                splitReadableWords[i] = splitWord.join('')
            }
            pass += splitReadableWords.join(',') // these will be replaced by special characters and numbers if checked
        }
        // check if add special is checked
        if (global_app_data.e_pass_settings.inc_special) {
            // add random number of special characters.
            // get amount of spaces left from current string
            let spaceLeft = len - pass.split(',').join('').length
            let numOfSpecials = global_app_data.e_pass_settings.inc_numbers ? Math.floor(spaceLeft / 2) : spaceLeft
            console.log("space left: " + spaceLeft + "| Number of special chars: " + numOfSpecials)
            let randomSpecialChars = ""
            for (var i = 0; i <= numOfSpecials; i++) {
                randomSpecialChars += specialChars[returnRandomNumber(specialChars.length)]
            }
            // now add special chars to pass
            
        }
        console.log("special chars added: " + pass)
    } else {
        // randomize
    }

    // for (var i = 0; i < len; i++) {
    //     pass += chars[Math.floor(Math.random() * chars.length)];
    // }
    return pass;
};

// generate password function
const generatePasswordOutput = () => {
    let generatedPass = makePassword(global_app_data.e_pass_length)
    $(passwordOutput).val(generatedPass);
    // save to local storage to access later
    global_app_data.e_password = generatedPass
    saveToLocalStorage()
};

// load password settings
const loadPasswordSettings = () => {
    global_app_data.e_pass_settings.inc_readable ? $(pass_gen_setting_readable).attr({ "checked": true }) : $(pass_gen_setting_readable).attr({ "checked": false })
    global_app_data.e_pass_settings.inc_numbers ? $(pass_gen_setting_nums).attr({ "checked": true }) : $(pass_gen_setting_nums).attr({ "checked": false })
    global_app_data.e_pass_settings.inc_uppercase ? $(pass_gen_setting_upper).attr({ "checked": true }) : $(pass_gen_setting_upper).attr({ "checked": false })
    global_app_data.e_pass_settings.inc_special ? $(pass_gen_setting_specials).attr({ "checked": true }) : $(pass_gen_setting_specials).attr({ "checked": false })
}
// load password generator function
const loadPasswordGenerator = () => {
    //load in default password length
    $(passwordLength).val(global_app_data.e_pass_length)
    // load settings
    loadPasswordSettings()
    // load current password from global
    if (global_app_data.e_password !== "") {
        $(passwordOutput).val(global_app_data.e_password)
    }
}

$(() => {
    // start
    loadPasswordGenerator()
    // when clicked on have value ready to be changed
    $(pass_char_num).on("click", (e) => {
        $(pass_char_num).select();
    })
    // password length input
    passwordLength.on("keyup change", (e) => {
        let a = e.target.value;
        // save to local storage to access later
        global_app_data.e_pass_length = a
        saveToLocalStorage()
    });
    // generate on click
    generatePassBtn.on("click", (e) => {
        generatePasswordOutput();
    });

    // copy function
    $(passwordOutput).on("click", (e) => {
        e.preventDefault()
        copyFunction("#password_output")
    });
    // clear output
    $(clearPassOutputBtn).on("click", (e) => {
        e.preventDefault()
        $(passwordOutput).val('')
        // clear local
        global_app_data.e_password = ""
        saveToLocalStorage()
    })

    // actions for password settings
    $(pass_gen_setting_readable).change(function () {
        console.log('clicked Readable!')
        if ($(pass_gen_setting_readable).is(':checked')) {
            // set setting to true
            global_app_data.e_pass_settings.inc_readable = true
        } else {
            // set setting to false
            global_app_data.e_pass_settings.inc_readable = false
        }
        saveToLocalStorage()
    })

    $(pass_gen_setting_specials).change(function () {
        if ($(pass_gen_setting_specials).is(':checked')) {
            // set setting to true
            global_app_data.e_pass_settings.inc_special = true
        } else {
            // set setting to false
            global_app_data.e_pass_settings.inc_special = false
        }
        saveToLocalStorage()
    })

    $(pass_gen_setting_upper).change(function () {
        if ($(pass_gen_setting_upper).is(':checked')) {
            // set setting to true
            global_app_data.e_pass_settings.inc_uppercase = true
        } else {
            // set setting to false
            global_app_data.e_pass_settings.inc_uppercase = false
        }
        saveToLocalStorage()
    })

    $(pass_gen_setting_nums).change(function () {
        if ($(pass_gen_setting_nums).is(':checked')) {
            // set setting to true
            global_app_data.e_pass_settings.inc_numbers = true
        } else {
            // set setting to false
            global_app_data.e_pass_settings.inc_numbers = false
        }
        saveToLocalStorage()
    })
})