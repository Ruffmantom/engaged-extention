const addNoteToDom = (noteData) => {
    noteListContainer.prepend(createNote(noteData));
}

function createNewNote() {
    let noteDataObj = {}
    noteDataObj.id = createId()
    noteDataObj.note = global_app_data.stagingDefault.text
    noteDataObj.label = ""
    noteDataObj.dateCreated = createDate()
    global_app_data.e_notes.unshift(noteDataObj)
    // clear values
    global_app_data.stagingDefault.text = ''
    global_app_data.stagingDefault.editing = false
    $(noteInputElm).val('')
    saveToLocalStorage()
    // store the staging object
    saveToLocalStorage()
    addNoteToDom(noteDataObj)
}

const loadNoteData = () => {
    if (global_app_data.e_notes.length >= 1) {
        // render them out
        for (const note of global_app_data.e_notes) {
            noteListContainer.append(createNote(note));
        }
        // load in the staging object
    }
    // console.log(globalStaging.editing)
    if (global_app_data.stagingDefault.editing) {

        $(noteInputElm).val(global_app_data.stagingDefault.text)
    }
}

const deleteNote = (noteId) => {
    // Find the index of the note with the given noteId in the usersNotes array
    const index = global_app_data.e_notes.findIndex(note => note.id === noteId);

    if (index !== -1) {
        // Remove the note from the usersNotes array
        global_app_data.e_notes.splice(index, 1);

        // Update the local storage
        saveToLocalStorage();

        // Remove the corresponding HTML element from the page
        $(`.user_note button[data-noteid="${noteId}"]`).closest('.user_note').addClass('deleted_note')
        let deleteNoteHold = setTimeout(() => {
            $(`.user_note button[data-noteid="${noteId}"]`).closest('.user_note').remove()
            clearTimeout(deleteNoteHold)
        }, 160)
    }
}


// on ready
$(function () {
    // loading and appending notes
    loadNoteData()
    // actions
    // save note progress
    $(noteInputElm).on('keyup change', (e) => {
        let noteValue = e.target.value

        // saving in project
        global_app_data.stagingDefault.text = noteValue
        global_app_data.stagingDefault.editing = true
        // saving to local storage incase of reload
        saveToLocalStorage()
    })
    // add note action
    $(addNoteBtn).on('click', (e) => {
        e.preventDefault()
        // console.log('clicked create new note!')
        createNewNote()

    })
    // delegation by targeting the parent element and looking
    //for a click from the dynamically added notes
    noteListContainer.on('click', '.delete_btn', function () {
        // Get the noteId from the data attribute of the clicked delete button
        const noteId = $(this).data('noteid');

        // Call the deleteNote function with the noteId
        deleteNote(noteId);
    });



})