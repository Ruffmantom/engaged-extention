// close menu
const closeTodoMenu = () => {
    if (todoMenuIsOpen) {
        $(".todo_list_menu").removeClass("todo_list_menu_active")
        todoMenuIsOpen = false
    }
}

// returns the current list helper
const returncurrList = () => {
    return global_app_data.e_todos.find(l => l.active === true)
}

// get the completion percentage
const getCompletionPercentage = (currList) => {
    if (currList.todos.length >= 1) {
        let numberOfTodos = currList.todos.length;
        let completeTodos = currList.todos.filter(t => t.checked);
        let numberOfCompleteTodos = completeTodos.length;
        return `${Math.floor((numberOfCompleteTodos / numberOfTodos) * 100)}%`;
    } else {
        return '0%';
    }
};

// update the global_app_data.e_todos global value
const updateGlobalUsersTodos = (updatedList) => {
    const index = global_app_data.e_todos.findIndex(item => item.id === updatedList.id);
    // Update the corresponding item in global_app_data.e_todos
    global_app_data.e_todos[index] = updatedList;

    saveToLocalStorage()
}
// create a new todo list
// create list
const createTodoListAction = (first, listName) => {
    let list = {}
    list.id = createId()
    list.name = listName
    list.todos = []
    list.active = false
    list.hideComplete = false

    if (first) {
        list.active = true
    }
    // push new list into global_app_data.e_todos add to end of array
    global_app_data.e_todos.push(list)
    // add list to list menu
    $(todoMenuListItemCont).append(createTodoList(list)) // adds to end of list
    // clear first input
    $(addFirstListInputElm).val("")
    // Clear menu input
    $(addNewListInputElm).val("")
    // re render the UI
    updateFullTodoUi()
}

// create a new todo
const createTodoAction = (todoVal) => {
    if (todoVal !== "") {
        // create todo
        let todo = {}
        todo.todo = todoVal
        todo.id = createId()
        todo.createdDate = createDate()
        todo.dueDate = ''
        todo.checked = false
        // save to global_app_data.e_todos
        let updateList = returncurrList()
        updateList.todos.push(todo) // add to end of array
        // update global_app_data.e_todos
        updateGlobalUsersTodos(updateList)
        $(todoItemCont).append(createTodo(todo)) // add to end of list
        // reset
        $(addTodoInputElm).val("")
        //update UI
        updateFullTodoUi()
        // scroll when new todo is added
        $(todoItemCont).animate({
            scrollTop: $(todoItemCont)[0].scrollHeight
        }, 500);
    } else {
        sendNotification('fast', 3000, 'Please enter a todo')
    }
}

// show or hide create list form
const showOrHideAddNewTodoListForm = (show) => {
    if (show) {
        $(addNewTodoListForm).css("display", "flex")
        $(".my_todo_lists_footer").hide()
    } else {
        $(addNewTodoListForm).css("display", "none")
        $(".my_todo_lists_footer").show()
    }
}


const showTodoListArea = (show) => {
    if (show) {
        $(startTodoListCont).css('display', 'none');
        // show todo area
        $(todoAreaCont).css('display', "block");
    } else {
        $(startTodoListCont).css('display', 'flex');
        // show todo area
        $(todoAreaCont).css('display', "none");
    }
}

// update the 
const updateUsersTodos = (updatedList) => {
    const index = global_app_data.e_todos.findIndex(item => item.id === updatedList.id);

    let updatedUI = false;

    if (index !== -1) {
        // Update the corresponding item in global_app_data.e_todos
        global_app_data.e_todos[index] = updatedList;
        // update local storage with global_app_data.e_todos
        saveToLocalStorage();
        updatedUI = true
    } else {
        console.error(`Item with id ${updatedList.id} not found in global_app_data.e_todos.`);
        updatedUI = false
    }
}

// handle checking the todo on the UI
const updateTodoCheckedStateUI = (todoId, checked) => {
    // console.log('about to update UI');
    const todoItemArr = Array.from($(".todo_item")); // Re-query todo items

    todoItemArr.forEach(t => {
        // console.log('Inside foreach');
        if ($(t).data("todoid") === todoId) {
            if (checked) {
                $(t).addClass('todo_checked');
                $(t).children('.todo_due_date').addClass('complete')
            } else {
                $(t).removeClass('todo_checked');
                $(t).children('.todo_due_date').removeClass('complete')
            }
        }
    });
};

// this is more for if the show button gets clicked, not a load
// handle displaying the completed tasks
const handleDisplayCompletedTasks = (showHideButtonClicked) => {
    const todoItemArr = Array.from($(".todo_item"));
    // hide completed tasks from dom
    let currList = returncurrList()
    // toggle the hideComplete
    if (showHideButtonClicked) {
        if (currList.hideComplete) {
            currList.hideComplete = false;
        } else {
            currList.hideComplete = true;
        }
    }

    if (currList.hideComplete) {
        $("#show_complete_todos").show()
        $("#hide_complete_todos").hide()
        // render all todos that are complete
        todoItemArr.forEach(t => {
            if ($(t).hasClass("todo_checked")) {
                $(t).hide()
            }
        })
    } else {
        $("#show_complete_todos").hide()
        $("#hide_complete_todos").show()

        todoItemArr.forEach(t => {
            if ($(t).hasClass("todo_checked")) {
                $(t).show()
            }
        })
    }

    updateUsersTodos(currList);
}

// update the list ui with every action
const updateFullTodoUi = () => {
    // check and hide todos if needed
    handleDisplayCompletedTasks(false)
    // update the list complete status
    let currList = returncurrList()
    let completePercentage = getCompletionPercentage(currList)
    let listItemsArr = Array.from($(".todo_list_item_completion"))
    // update the list percentage in menu
    listItemsArr.forEach(l => {
        if ($(l).data("listid") === currList.id) {
            $(l).text(`${completePercentage} complete`)
        }
    })
    // empty menu first
    $(todoMenuListItemCont).empty()
    // Render todo menu lists in the menu
    global_app_data.e_todos.forEach(l => {
        $(todoMenuListItemCont).append(createTodoList(l)); // add to bottom of list
    });
    // scroll list to bottom
    $(".todo_list_item_cont").animate({
        scrollTop: $(".todo_list_item_cont")[0].scrollHeight
    }, 500);
    // set UI
    // set list title
    $(todoListTitle).text(currList.name)
    // add attribute
    $(changeListTitleInput).attr('data-listid', currList.id);
    // se the number of todos
    $(todoListNumberTextElm).text(currList.todos.length + " Todo's")
    // set width of progress bar
    $(progressBarElm).css({
        "width": completePercentage,
        "transition": "width 150ms ease"
    })
    // update the completion text
    $(todoListCompletionText).text(`${completePercentage} complete`)
    // update the progress bar color if 100%
    if (completePercentage === "100%") {

        $(progressBarElm).addClass('todo_progress_bar_complete')
    } else {
        $(progressBarElm).removeClass('todo_progress_bar_complete')

    }
    // update local storage with global_app_data.e_todos
    saveToLocalStorage()
}

// when a todo gets checked or unchecked
const todoCheckHandler = (todoId) => {
    let currList = returncurrList();
    let todoToUpdate = currList.todos.find(t => t.id === todoId);

    if (todoToUpdate) {
        // Toggle the checked status
        todoToUpdate.checked = !todoToUpdate.checked;

        // Update UI
        updateTodoCheckedStateUI(todoId, todoToUpdate.checked);
        //update the list as well if the hide complete is active
        updateFullTodoUi()
        // Save updated current list to global_app_data.e_todos
        updateUsersTodos(currList);
    }
};

// load in the global_app_data.e_todos
const loadUsersTodos = () => {
    if (global_app_data.e_todos.length >= 1) {
        // hide the start of todo list if none
        showTodoListArea(true)

        // Load the current list todos and sort them
        let currList = returncurrList();
        let sortedList = currList.todos.sort((a, b) => {
            // sort by checked state (unchecked first)
            if (a.checked !== b.checked) {
                return a.checked ? -1 : 1;
            }
        });

        // empty the todo container before rendering them.
        $(todoItemCont).empty()
        // Render sorted todos
        sortedList.forEach(todo => {
            $(todoItemCont).append(createTodo(todo));
        });
        // check and hide todos if needed
        handleDisplayCompletedTasks(false)
    } else {
        showTodoListArea(false)
    }
};

const deleteTodo = (todoId) => {
    // delete from global_app_data.e_todos
    let currList = returncurrList();
    let updatedList = currList.todos.filter(t => t.id !== todoId);

    currList.todos = updatedList
    // update data
    updateUsersTodos(currList);
    // console.log(updatedList)
    // transition out from UI
    const todoItemToDelete = $(`.todo_item[data-todoid="${todoId}"]`);

    todoItemToDelete.addClass('deleted_todo');

    // After the transition is complete, remove the todo item from the DOM
    todoItemToDelete.on('transitionend', function () {
        $(this).remove();
    });
    updateFullTodoUi()
};

// update active list styles
const setActiveStylesToList = () => {
    let listItemArr = Array.from($('.todo_list_item'))
    listItemArr.forEach(i => {
        let c = returncurrList()
        // console.log('List item id: ', $(i).data("listid"))
        // console.log('Current List Item: ', c)
        if (c.id !== $(i).data("listid")) {
            // remove active class
            $(i).removeClass('active_todo_list')
        } else {
            $(i).addClass('active_todo_list')
        }
    })
}
// need to readjust this function
const saveLastActiveList = () => {
    let lastActiveList = ''
    let currList = returncurrList()
    lastActiveList = currList.id
    // save that to local storage
    global_app_data.e_todos_lal = lastActiveList
    saveToLocalStorage()
}

const getLastActiveList = () => {
    // get the saved id
    return global_app_data.e_todos_lal
}

// change active list
const changeList = (listId) => {
    // global_app_data.e_todos data change the current active list to false
    saveLastActiveList()
    // assign new todo list active to true
    global_app_data.e_todos.forEach(l => {
        if (l.id === listId) {
            // set active
            l.active = true
        } else {
            l.active = false
        }
    })
    // save to local storage
    saveToLocalStorage()
    // global_app_data.e_todos.
    setActiveStylesToList()
    // update UI
    updateFullTodoUi()
    // load todos
    loadUsersTodos()
}

// update list name
const saveListName = (listName, listId) => {
    // update global_app_data.e_todos
    global_app_data.e_todos.forEach(l => {
        if (l.id === listId) {
            l.name = listName
        }

    })
    // save to db
    saveToLocalStorage()
    // update UI
    updateFullTodoUi()
}

// delete todo lists
const deleteTodoList = (listId) => {
    // remove list from global_app_data.e_todos
    // set new active list if deleting current active one
    let deletingActiveList = false;
    global_app_data.e_todos.forEach(l => {
        // console.log(l)
        if (l.id === listId && l.active) {
            l.active = false
            deletingActiveList = true
        }
    })



    let updatedUserTodos = global_app_data.e_todos.filter(l => l.id !== listId);
    global_app_data.e_todos = updatedUserTodos

    if (deletingActiveList) {
        console.log('Deleting active list? ' + deletingActiveList)
        let lastActiveList = getLastActiveList()
        if (lastActiveList === "") {
            // default to first list in array
            if (global_app_data.e_todos.length >= 1) {
                // set all to false if more than one list
                // global_app_data.e_todos.forEach(l => {
                //     l.active = false
                // })
                // set the first to true
                console.log("about to set the first index to active!")
                global_app_data.e_todos[0].active = true
            }
        } else {

            global_app_data.e_todos.forEach(l => {
                if (l.id === lastActiveList) {
                    console.log("Yes found last active list")
                    l.active = true
                }
            })
        }
    }

    console.log("After delete: ", global_app_data.e_todos)
    // save to local storage
    saveToLocalStorage()

    if (global_app_data.e_todos.length <= 0) {
        // hide container and show start of new list
        // hide the start of todo list if none
        showTodoListArea(false)
    } else {
        // update UI
        setActiveStylesToList()
        // update UI
        updateFullTodoUi()
        // load todos
        loadUsersTodos()
    }
}

// create json export
const createJsonExport = (listData) => {
    console.log(listData)
    // Convert JSON to a string
    const jsonString = JSON.stringify(listData, null, 2);
    // Create a Blob containing the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    // Create a link element
    const a = document.createElement('a');
    // Create a URL for the Blob and set it as the link's href
    a.href = URL.createObjectURL(blob);
    // create name for file
    let listName = listData.name.replace(/[^a-zA-Z0-9_]/g, '-');
    // Set the filename for the downloadable file
    a.download = `${listName}.json`;
    // Append the link to the document
    document.body.appendChild(a);
    // simulate click
    a.click();

    // Remove the link from the document
    document.body.removeChild(a);

    sendNotification('fast', 3000, 'List has been downloaded')
}

const importJsonListData = (data) => {
    // take file contents
    // add json object to todolist array
    console.log(data)
    let foundList = global_app_data.e_todos.some(l => {
        return l.id === data.id
    })

    console.log(foundList)
    if (foundList) { // if found list === 0 then it is false
        sendNotification('fast', 3000, 'This list has already been added')
        return
    } else {
        data.active = false
        global_app_data.e_todos.push(data)
        // add scroll function to top of list
        sendNotification('fast', 3000, `${data.name} list has been added!`)
    }
    console.log(global_app_data.e_todos)
    // save to local
    saveToLocalStorage()
    // rerender list
    updateFullTodoUi()

    // clear file input
    $("#todo_list_import").val('');

}

// -----------------------------------------------------------------------------------
//  ******************************************************************************************
// -----------------------------------------------------------------------------------
// document on load
$(function () {
    // on load see if current list is hiding or showing completed
    let currList = returncurrList()
    if (currList) {
        // load in the todos on load
        loadUsersTodos()
        updateFullTodoUi()
    }
    // first time creating todo list
    addFirstListBtn.on("click", (e) => {
        e.preventDefault()
        if ($(addFirstListInputElm).val() !== "") {
            let listValue = $(addFirstListInputElm).val()
            createTodoListAction(true, listValue)
            // eventually add a load function that hides this if theres already a list item
            showTodoListArea(true)
            // save list data
            saveToLocalStorage()
        } else {
            sendNotification('fast', 3000, 'Please enter a list name')
        }
    })

    // open the todo list menu
    todoListMenuBtn.on('click', () => {
        if (todoMenuIsOpen) {
            // close menu
            closeTodoMenu()
        } else {
            // open menu
            $(".todo_list_menu").addClass("todo_list_menu_active")
            todoMenuIsOpen = true
        }

        // close todo list menu
        $(document).on("click", function (event) {
            // Check if the click event target is not within the menu
            if (!todoMenu.is(event.target) && todoMenuIsOpen && !todoListMenuBtn.is(event.target) && todoMenu.has(event.target).length === 0) {
                closeTodoMenu()
            }
        });
    })

    // add todo
    addNewTodoBtn.on("click", (e) => {
        e.preventDefault()
        // create todo
        let todoVal = $(addTodoInputElm).val()
        createTodoAction(todoVal)
    })

    // if typing in todo input and press enter
    let todoTextInput = $(`#add_new_todo_item_input`);
    todoTextInput.keydown(function (event) {
        var keycode = event.keyCode ? event.keyCode : event.which;

        if (keycode == 13 && !event.shiftKey) {
            // Prevent default behavior if Enter is pressed without Shift
            event.preventDefault();
            createTodoAction($(this).val())
        }
    });


    // add new list
    // show form for new todo list
    $(showAddNewTodoListFormBtn).on("click", (e) => {
        e.preventDefault()
        showOrHideAddNewTodoListForm(true)
    })
    // hide from for new todo list
    $(cancelAddNewTodoListBtn).on("click", () => {
        showOrHideAddNewTodoListForm(false)
    })

    // create new list
    $(addNewTodoListBtn).on("click", (e) => {
        e.preventDefault()

        let newListVal = $(addNewListInputElm).val()
        if (newListVal !== "") {
            // make new list and set current id
            createTodoListAction(false, newListVal)
            // reset
            $(addNewListInputElm).val('')
            showOrHideAddNewTodoListForm(false)
            // setActiveStylesToList()
            // console.log(global_app_data.e_todos)
        } else {
            sendNotification('fast', 3000, 'Please enter a list name')
        }

    })

    // handle edit todo
    // Use event delegation to handle clicks on dynamically created elements
    $(".todo_cont").on("click", ".todo_item_text", function () {
        // Find the parent container of the clicked element
        var todoItem = $(this).closest(".todo_item");

        // Get the value of the data-todoid attribute
        clickedTodoTextId = todoItem.data("todoid");

        let todoEditTextInput = $(`.todo_change_text_input[data-todoid="${clickedTodoTextId}"]`);

        todoEditTextInput.keydown(function (event) {
            var keycode = event.keyCode ? event.keyCode : event.which;

            if (keycode == 13 && !event.shiftKey) {
                // Prevent default behavior if Enter is pressed without Shift
                event.preventDefault();
                console.log($(this).val());

                // Now save the value to the current todo
                let currList = returncurrList();

                currList.todos.forEach(t => {
                    if (t.id === clickedTodoTextId) {
                        t.todo = $(this).val();
                    }
                });

                updateUsersTodos(currList);
                loadUsersTodos()
                // Perform any other action you need with the entered value

                // Hide the input field and show the <p> tag
                todoItem.find(".change_todo_form").hide();
                todoItem.find(".todo_item_text").show();
            }
        });

        // Hide the <p> tag and show the <textarea> input field
        todoItem.find(".todo_item_text").hide();
        todoItem.find(".change_todo_form").css("display", "block");
        todoItem.find(".todo_change_text_input").focus();

        $(document).on("click", function (event) {
            // Check if the click event target is not within the menu
            if (!todoItem.is(event.target) && todoItem.has(event.target).length === 0) {
                todoItem.find(".change_todo_form").hide();
                todoItem.find(".todo_item_text").show();
            }
        });
    });


    // handle todo due date click
    const dueDateModalCont = $("#add_due_date_modal_cont")
    // on load, set up the date picker to only have future dates
    var currentDate = new Date().toISOString().split('T')[0];
    let dueDateConfig = {
        currentlySelectedTodo: '',
        newDueDate: '',
    }
    const openDueDateModal = (open) => {

        if (!open && $(dueDateModalCont).hasClass("modal_active")) {
            $(dueDateModalCont).removeClass('modal_active')
        } else {
            $(dueDateModalCont).addClass('modal_active')
        }
    }
    // Set the minimum date for the date input
    $(dueDateInputElm).attr('min', currentDate);

    $(".todo_cont").on("click", ".todo_set_due_date_btn", function () {
        let todoId = $(this).data("todoid");
        console.log("Need to set due date for: " + todoId)
        openDueDateModal(true)
        // set state
        dueDateConfig.currentlySelectedTodo = todoId
        // load in current date if has one
        let currList = returncurrList()
        let currentTodo = currList.todos.filter(t => t.id === todoId)
        if (currentTodo[0].dueDate !== "") {
            $('.chosen_due_date').text(`Current Due date: ${formatDate(currentTodo[0].dueDate)}`)
            // set value of input
            $(dueDateInputElm).val(currentTodo[0].dueDate)
        }
    });

    // close dueDate modal button
    $("#close_due_date_btn").on('click', () => {
        openDueDateModal(false)
    })

    $(dueDateInputElm).on('change', e => {
        let d = $(e.target).val()
        $('.chosen_due_date').text(`Selected date: ${formatDate(d)}`)
        // save to duedate state
        dueDateConfig.newDueDate = ''
        dueDateConfig.newDueDate = d
    })
    // save due date for todo

    $(saveDueDateBtn).on("click", e => {
        e.preventDefault()
        let currList = returncurrList()
        console.log(dueDateConfig)
        currList.todos.forEach(t => {
            if (t.id === dueDateConfig.currentlySelectedTodo) {
                t.dueDate = dueDateConfig.newDueDate
            }
        })
        // update the users todos
        updateUsersTodos(currList);
        // close modal
        openDueDateModal(false)
        // update UI
        // update UI
        updateFullTodoUi()
        // load todos
        loadUsersTodos()

    })
    // handle cancel changing the todo text
    $(".todo_cont").on("click", ".cancel_change_todo_btn", function () {
        var todoItem = $(this).closest(".todo_item");

        todoItem.find(".change_todo_form").hide();
        todoItem.find(".todo_item_text").show();
    });

    // handle check todo
    $(".todo_cont").on('click', '.complete_todo', function () {
        let todoId = $(this).data("todoid");
        todoCheckHandler(todoId);
    });

    // handle delete todo
    $(".todo_cont").on('click', '.todo_delete_btn', function () {
        let todoId = $(this).data("todoid");
        // console.log("Delete todo: " + todoId)
        deleteTodo(todoId)
    });


    // handle hide completed tasks button
    $(hideCompleteTodosBtn).on('click', (e) => {
        // console.log('hide complete!')
        let currList = returncurrList()
        if (currList.todos.length === 0) {
            sendNotification("fast", 3000, "There are no completed todo's")
        } else {
            let completedTodos = false
            currList.todos.filter(t => {
                if (t.checked) {
                    completedTodos = true
                }
            })
            if (!completedTodos) {
                sendNotification("fast", 3000, "There are no completed todo's")
            } else {
                handleDisplayCompletedTasks(true)
            }

        }

    })
    // handle show the completed todos
    $(showCompleteTodosBtn).on('click', (e) => {
        // console.log('show complete!')
        handleDisplayCompletedTasks(true)

    })
    // handle list click
    $(".todo_list_item_cont").on('click', '.todo_list_btn ', function () {
        let listId = $(this).data("listid");
        changeList(listId)
    });
    // handle delete todo list
    $(".todo_list_item_cont").on('click', '.todo_list_delete_btn ', function () {
        let listId = $(this).data("listid");
        console.log("delete list: " + listId)
        deleteTodoList(listId)
    });

    // when list title gets clicked
    $(todoListTitle).on('click', e => {
        // set input value
        let currList = returncurrList()
        $(changeListTitleInput).val(currList.name)
        // hide the title and show the input
        $(todoListTitle).hide()
        $(changeListTitleInput).show();
        // focus on the input
        $(changeListTitleInput).focus();
    })


    $(changeListTitleInput).keydown(function (event) {
        var keycode = event.keyCode ? event.keyCode : event.which;

        if (keycode == 13 && !event.shiftKey) {
            // Prevent default behavior if Enter is pressed without Shift
            event.preventDefault();
            saveListName($(this).val(), $(this).data("listid"))
            // hide input and show title
            $(todoListTitle).show()
            $(changeListTitleInput).hide();
        }
    });


    // export todo list
    // todo_list_menu parent elm
    // on click export btn

    $(".todo_list_menu").on('click', '.download_todo_list_btn', function (e) {
        let listId = $(e.target).data('listid');
        let foundList = global_app_data.e_todos.find(l => l.id === listId);
        createJsonExport(foundList);
    });
    // import functionality
    $("#import_todo_list_btn").click(function () {
        // Trigger a click on the hidden file input
        $("#todo_list_import").click();
    });

    // When a file is selected using the file input
    $("#todo_list_import").change(function () {
        // Handle the file import logic here
        // console.log("File selected:", $(this).val());
        const fileInput = event.target;
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                try {
                    // Parse the JSON data from the file
                    const jsonData = JSON.parse(e.target.result);

                    // Handle the JSON data as needed
                    importJsonListData(jsonData)
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            };

            // Read the file as text
            reader.readAsText(file);
        }
    });

    // sortable todo items
    $(".todo_cont").sortable({
        handle: ".todo_item_cont",
        helper: "clone",
        tolerance: "pointer",
        axis: 'y',
        containment: "parent",
        cursor: "grabbing",
        update: function (event, ui) {
            let sortedIDs = $(this).sortable("toArray", { attribute: "data-todoid" });
            let currList = returncurrList()
            // sort todos based on what the user moved
            let sortedTodos = sortedIDs.map(id =>
                currList.todos.find(todo => todo.id.toString() === id)
            );
            // update currentTodo list
            currList.todos = sortedTodos
            // updateUsersTodos(currList)
            updateGlobalUsersTodos(currList)
        },
    });
    // sortable lists in menu
    $(".todo_list_item_cont").sortable({
        handle: ".todo_list_btn",
        // helper: "clone",
        tolerance: "pointer",
        axis: 'y',
        containment: "parent",
        cursor: "grabbing",
        update: function (event, ui) {
            let sortedIDs = $(this).sortable("toArray", { attribute: "data-listid" });
            // sort lists based on sortedIds
            let sortedLists = sortedIDs.map(id =>
                global_app_data.e_todos.find(list => list.id === id)
            )

            global_app_data.e_todos = sortedLists
            // save to local
            saveToLocalStorage()
        },
    });





    // end of doc ready
})