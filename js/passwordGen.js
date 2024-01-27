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
    //load in default password length
    $(passwordLength).val(global_app_data.e_pass_length)
    // when clicked on have value ready to be changed
    $(pass_char_num).on("click", (e) => {
        $(pass_char_num).select();
    })
    // load current password from global
    if (global_app_data.e_password !== "") {
        $(passwordOutput).val(global_app_data.e_password)
    }
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
    $(clearPassOutputBtn).on("click",(e)=>{
        e.preventDefault()
        $(passwordOutput).val('')
        // clear local
        global_app_data.e_password = ""
        saveToLocalStorage()
    })
})