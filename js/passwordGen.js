const makePassword = (len) => {
    let pass = "";
    for (var i = 0; i < len; i++) {
        pass += chars[Math.floor(Math.random() * chars.length)];
    }
    return pass;
};
// generate password function
const generatePasswordOutput = () => {
    let currPass = makePassword(global_app_data.e_pass_length)
    $(passwordOutput).val(currPass);
    // save to local storage to access later
    global_app_data.e_password = currPass
    saveToLocalStorage()
};

$(() => { 
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
        copyFunction(e, "#password_output", "#text_output")
    });
})