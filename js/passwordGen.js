const returnRandomNumber = (length) => {
    return Math.floor(Math.random() * length)

}

const findWordsToFit = (length) => {
    // // console.log(length)
    let pass = ""
    let filteredWords = wordList.filter(w => {
        return w.length <= length
    })
    // add random words to pass string
    for (var i = 0; i <= filteredWords.length; i++) {
        let randomWord = filteredWords[returnRandomNumber(filteredWords.length)]
        // check if pass length is fulfilled
        if (pass.length + randomWord.length > length) {
            // // console.log("Pass with words: " + pass)
            return pass
        }
        // if its still less than length then keep iterating
        pass += randomWord + ","
    }
}

// generate readable words
const generateReadableWords = () => {
    // return words that are less than or equal to length
    let readableWords = findWordsToFit(global_app_data.e_pass_length)
    // check if upper is checked
    if (global_app_data.e_pass_settings.inc_uppercase) {
        let splitReadableWords = readableWords.split(',');
        for (let i = 0; i < splitReadableWords.length; i++) {
            let word = splitReadableWords[i].trim();
            if (word !== "") {

                let splitWord = word.split('');

                // Capitalize one random letter initially
                let initialCapIndex = returnRandomNumber(splitWord.length);
                splitWord[initialCapIndex] = splitWord[initialCapIndex].toUpperCase();

                // Decide how many more letters to capitalize (could be 0)
                let additionalCaps = Math.floor(Math.random() * splitWord.length);

                for (var ii = 0; ii < additionalCaps; ii++) {
                    let randomIndex = returnRandomNumber(splitWord.length);
                    splitWord[randomIndex] = splitWord[randomIndex].toUpperCase();
                }

                splitReadableWords[i] = splitWord.join('');
            }
        }
        // console.log(splitReadableWords.join(','))
        return splitReadableWords.join(',');
    } else {
        return ""
    }
}

const generateSpecialCharacters = (pass, len) => {
    if (global_app_data.e_pass_settings.inc_special) {
        // add random number of special characters.
        // get amount of spaces left from current string
        let spaceLeft = len - pass.split(',').join('').length
        let numOfSpecials = global_app_data.e_pass_settings.inc_numbers ? Math.floor(spaceLeft / 2) : spaceLeft
        // // // console.log("space left: " + spaceLeft + "| Number of special chars: " + numOfSpecials)
        let randomSpecialChars = ""
        for (var i = 0; i <= numOfSpecials; i++) {
            randomSpecialChars += specialChars[returnRandomNumber(specialChars.length)]
        }
        // return
        // console.log("Returnning randomSpecialChars: " + randomSpecialChars)
        return randomSpecialChars
    } else {
        return ""
    }
}

const generateNumbers = (numOfNumsToAdd) => {
    if (global_app_data.e_pass_settings.inc_numbers) {
        // // // console.log("space left: " + spaceLeft + "| Number of special chars: " + numOfSpecials)
        let randomNumbersString = ""
        for (var i = 0; i <= numOfNumsToAdd; i++) {
            randomNumbersString += numChars[returnRandomNumber(numChars.length)]
        }
        // return
        return randomNumbersString
    } else {
        return ""
    }
}

// Function to shuffle an array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// final build readable password
const buildReadablePassword = (words, specialChars, numbers) => {
    // Split words and prepare characters
    const wordArray = words.split(',');
    const combinedChars = specialChars + numbers;
    let charArray = combinedChars.split('');

    // Shuffle the characters
    shuffleArray(charArray);

    // Build password
    let password = '';
    wordArray.forEach((word, index) => {
        password += word;
        if (index < wordArray.length - 1) {
            password += charArray.pop(); // Add one shuffled char between words
        }
    });

    // Add any remaining characters to the end
    password += charArray.join('');
    return password;
}

const makePassword = (len) => {
    // init returnable password
    let genWords = ""
    let genSpecialChars = ""
    let genNumbers = ""

    // build password based on if readable or not
    if (global_app_data.e_pass_settings.inc_readable) {
        // return the words
        genWords = generateReadableWords()
        // console.log("genwords before genspecial: " + genWords)
        // return Special
        genSpecialChars = generateSpecialCharacters(genWords, len)
        // return numbers
        let passwordSoFar = genWords + genSpecialChars
        // console.log("genwords after passwordsofar: " + genWords)
        let spaceLeft = len - passwordSoFar.split(',').join('').length
        let numOfNumsToAdd = global_app_data.e_pass_settings.inc_numbers ? Math.floor(spaceLeft / 2) : spaceLeft

        genNumbers = generateNumbers(numOfNumsToAdd)

        // build randomized password
        return buildReadablePassword(genWords, genSpecialChars, genNumbers)
    } else {
        // randomize
        let fullRandomString = chars

        if (global_app_data.e_pass_settings.inc_uppercase) {
            fullRandomString += upperChars
        }
        if (global_app_data.e_pass_settings.inc_numbers) {
            fullRandomString += numChars
        }
        if (global_app_data.e_pass_settings.inc_special) {
            fullRandomString += specialChars
        }


        // build password
        let pass = "";
        // scramble the string first before build
        let splitFullRandomString = fullRandomString.split('')
        let randomizedFullRandomString = splitFullRandomString.sort((a, b) => 0.5 - Math.random()).join('');
        for (var i = 0; i < len; i++) {
            pass += randomizedFullRandomString[Math.floor(Math.random() * randomizedFullRandomString.length)];
        }

        // check if password meets selected settings
        // if no capital letters
        if (global_app_data.e_pass_settings.inc_uppercase) {
            const regex = /[A-Z]/;
            if (!regex.test(pass)) {
                // if no capital letters select a random letter and make it capital
                let indexes = [];

                // Find indexes of all lowercase letters
                for (let i = 0; i < pass.length; i++) {
                    if (lowercaseRegex.test(pass[i])) {
                        indexes.push(i);
                    }
                }

                // Select a random lowercase letter and make it uppercase
                if (indexes.length > 0) {
                    const randomIndex = indexes[Math.floor(Math.random() * indexes.length)];
                    pass = pass.substring(0, randomIndex) + pass[randomIndex].toUpperCase() + pass.substring(randomIndex + 1);
                }
            }
        }

        // if no numbers added
        if (global_app_data.e_pass_settings.inc_numbers) {
            const regex = /\d/;
            if (!regex.test(pass)) {
                // If no numbers, replace a random character with a number
                const randomNumber = Math.floor(Math.random() * 10).toString();
                const randomIndex = Math.floor(Math.random() * pass.length);

                pass = pass.substring(0, randomIndex) + randomNumber + pass.substring(randomIndex + 1);
            }
        }
        // if no special chars
        if (global_app_data.e_pass_settings.inc_special) {
            const regex = /[!\$\)\(\-_@\*]/;

            if (!regex.test(pass)) {
                // If no special characters, replace a random character with a special character
                const specialCharacters = "!$)(-_@*";
                const randomSpecialChar = specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
                const randomIndex = Math.floor(Math.random() * pass.length);

                pass = pass.substring(0, randomIndex) + randomSpecialChar + pass.substring(randomIndex + 1);
            }
        }

        // return finished random password
        return pass;
    }

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
        // // console.log('clicked Readable!')
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