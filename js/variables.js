// *************** APP VARIABLES **************************
// Define global variable
let global_app_data = null

let global_app_default_data = {
    engage_theme: "false",
    engage_user_id: "",
    e_tab: 'one',
    e_pass_length: 5,
    e_password: "",
    e_pass_settings: {
        inc_readable: false,
        inc_numbers: true,
        inc_uppercase: true,
        inc_special: true,
    },
    e_notes: [],
    e_todos: [],
    e_todos_lal: "",
    e_note_stage: "",
    stagingDefault: {
        editing: false,
        text: ''
    },
    e_settings: {
        // put settings here
        enable_update_notifications: true,
    },
    e_updates: [],
    e_color_pallet: [],
    e_color_pallet_limit: 7
}

// create ID
var idChars = "3QKXV0F8IYCA7S5T4ZGJDWB9L1N26UHOMRPVE";
// *************** NAVIGATION VARIABLES **************************
const tabElm = $(".tab")
const tabNavBtnElm = $(".tab_nav_button")
// *************** MENU AND SETTINGS VARIABLES **************************
// default settings always on
// settings checkbox's
let settings = {
    // write settings here
}
const clearAllSettingsBtn = $("#settings_clear_all_data")
const settingsBtn = $("#settings_button")
const closeBtn = $('#close_settings_btn')
const settingsModalCont = $('#settings_modal_cont')
const menuBtnElm = $('.menu_btn')
let menuIsOpen = false;
// icons
const sunIcon = $("#sun_icon")
const moonIcon = $("#moon_icon")
// button
const themeBtn = $(".theme_button")
// radio buttons
const lightRadio = $("#light_mode")
const darkRadio = $("#dark_mode")
// *************** TODO VARIABLES **************************
// elements
const todoMenu = $(".todo_list_menu");
const addTodoInputElm = $("#add_new_todo_item_input")
const todoMenuListItemCont = $(".todo_list_item_cont")
const addFirstListInputElm = $("#add_first_list_input")
const startTodoListCont = $(".todo_start_cont")
const todoAreaCont = $(".main_todo_cont")
const todoListTitle = $("#todo_list_title")
const changeListTitleInput = $('#change_list_name_input')
const todoListCompletionText = $(".todo_completion_percentage")
const progressBarElm = $('.todo_progress_bar')
const todoItemCont = $('.todo_cont')
const addNewListInputElm = $("#add_new_list")
const addNewTodoListForm = $(".create_new_todo_list_form")
const todoListItemCompletionTextElm = $(".todo_list_item_completion")
const todoListNumberTextElm = $(".todo_list_number")
const dueDateInputElm = $('#todo_due_date_input')
// btns
const todoListMenuBtn = $(".todo_list_nav_button")
const addNewTodoBtn = $("#add_new_todo_btn")
const hideCompleteTodosBtn = $("#hide_complete_todos")
const showCompleteTodosBtn = $("#show_complete_todos")
const addNewTodoListBtn = $("#add_todo_list_btn")
const deleteTodoListBtn = $(".todo_list_delete_btn")
const addFirstListBtn = $("#add_first_list_btn")
const showAddNewTodoListFormBtn = $("#show_add_todo_list_btn")
const cancelAddNewTodoListBtn = $("#cancel_add_new_todo_list")
const todoListButton = $(".todo_list_item")
const saveDueDateBtn = $("#save_due_date_btn")
const download_todo_list_btn = $(".download_todo_list_btn")
// global values
let todoMenuIsOpen = false;
// *************** NOTES VARIABLES **************************
// Elements
const noteInputElm = $("#add_note_textarea")
const noteListContainer = $('.note_container')
// BTNS
const addNoteBtn = $('#add_note_btn')
const deleteNoteBtn = $('.delete_btn')
// other
// loading function for notes
let isLoading = false;
// *************** PASSWORD GENERATOR VARIABLES **************************
const generatePassBtn = $("#generate_password_btn");
const clearPassOutputBtn = $("#clear_output_btn");
const passwordLength = $("#pass_char_num");
const passwordOutput = $("#password_output");
const pass_gen_setting_readable = $("#pass_gen_setting_readable")
const pass_gen_setting_specials = $("#pass_gen_setting_specials")
const pass_gen_setting_upper = $("#pass_gen_setting_upper")
const pass_gen_setting_nums = $("#pass_gen_setting_nums")
var chars = "abcdefghijklmnopqrstuvwxyz";
var upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
var numChars = "1234567890"
var specialChars = "!$)(-_@*"
// *************** OTHER VARIABLES **************************
const loader = $(".loader_container");
// *************** Color Pallet VARIABLES **************************
var c = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
const color_pallet_item_setting_btn = $(".color_pallet_item_setting_btn")
const e_color_pallet_cont = $(".e_color_pallet_cont")
const generate_colors_btn = $("#generate_colors_btn")
const e_color_pallet_css_output = $("#e_color_pallet_css_output")
const e_color_pallet_hex_output = $("#e_color_pallet_hex_output")
const copy_color_hidden_input = $("#copy_color_hidden_input")
const color_pallet_download_btn = $(".color_pallet_download_btn")
const e_pallet_download_drop_down_cont = $(".e_pallet_download_drop_down_cont")
const e_pallet_download_svg_btn = $("#e_pallet_download_svg_btn")
const e_pallet_download_png_btn = $("#e_pallet_download_png_btn")
const e_pallet_copy_css_btn = $("#e_pallet_copy_css_btn")
const e_pallet_copy_hex_btn = $("#e_pallet_copy_hex_btn")
// const e_pallet_download_pdf_btn = $("#e_pallet_download_pdf_btn")
// global values
let downloadPalletMenuOpen = false;
// *************** Updates Modal VARIABLES **************************
let close_updates_modal_btn = $("#close_updates_modal_btn")
let latestUpdate = null