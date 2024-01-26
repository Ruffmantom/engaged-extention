// *************** APP VARIABLES **************************
// Define global variable
let globalValues;
let usersNotes = [];
let usersTodos = [];
let globalStaging;
let stagingDefault = {
    editing: false,
    text: ''
}
let defaultValues = {
    currentTab: 'one',
}
const DATA_NAME = 'TF_DATA';
const TF_SETTINGS = 'TF_SETTINGS';
const TF_NOTES = 'TF_NOTES';
const TF_N_S = 'TF_N_S';
const TF_TODOS = 'TF_TODOS';
const TF_PO_DATA = 'TF_PO_DATA';
// loading function for notes
let isLoading = false;

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
// *************** PASSWORD GENERATOR VARIABLES **************************
const generatePassBtn = $("#generate_password_btn");
const passwordLength = $("#pass_char_num");
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!#$)(-_";