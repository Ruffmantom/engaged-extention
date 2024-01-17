const generatePassBtn = $("#generate_password_btn");
const passwordLength = $("#pass_char_num");

var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!#$)(-_";

const makePassword = (len) => {
    let pass = "";
    for (var i = 0; i < len; i++) {
        pass += chars[Math.floor(Math.random() * chars.length)];
    }
    return pass;
};
// generate password function
const generatePasswordOutput = () => {

    let currPass = makePassword(passLength)
    $(textOutput).val(currPass);
    // save to local storage to access later
    globalValues.outputValuePassword = currPass
    saveToLocalStorage(DATA_NAME, globalValues)
};



$(() => {

    // password length input
    passwordLength.on("keyup change", (e) => {
        let a = e.target.value;
        passLength = a;
        // save to local storage to access later
        globalValues.passLength = a
        saveToLocalStorage(DATA_NAME, globalValues)
    });
    // generate on click
    generatePassBtn.on("click", (e) => {
        generatePasswordOutput();
    });

    // copy function
    $("#password_output").on("click", (e) => {
        copyFunction(e, "#password_output", "#text_output")
    });
})