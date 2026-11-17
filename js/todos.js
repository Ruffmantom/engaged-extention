let editingTodoTarget = null;
let todoDueDateTarget = null;
const todoComposerDrafts = new Map();
const makeTodoId = () => crypto.randomUUID();
const returncurrList = () => TodoModel.activeList(global_app_data.e_todos);
const findTodo = (list, id) => list?.todos.find((todo) => TodoModel.key(todo.id) === TodoModel.key(id)) || null;
const getTodoEditor = () => addTodoInputElm[0];
const setTodoStatus = (message) => $('#todo_editor_status').text(message);

const getCompletionPercentage = (list) => {
    const { total, remaining, percent } = TodoModel.progress(list);
    return total ? `${percent}% finished, ${remaining} left out of ${total}` : 'No todos yet';
};

const closeTodoMenu = () => {
    todoMenu.removeClass('todo_list_menu_active').prop('hidden', true);
    todoListMenuBtn.attr('aria-expanded', 'false');
    todoMenuIsOpen = false;
};

const showOrHideAddNewTodoListForm = (show) => {
    addNewTodoListForm.css('display', show ? 'flex' : 'none');
    $('.my_todo_lists_footer').toggle(!show);
    if (show) addNewListInputElm.trigger('focus');
};

const renderTodoUi = () => {
    const lists = global_app_data.e_todos;
    const list = returncurrList();
    const scrollTop = todoItemCont.scrollTop();
    todoMenuListItemCont.html(lists.map(createTodoList).join(''));
    startTodoListCont.toggle(!list);
    todoAreaCont.toggle(Boolean(list));
    todoListTitle.text(list?.name || '');
    changeListTitleInput.attr('data-listid', list?.id || '');
    const { percent, total } = TodoModel.progress(list);
    progressBarElm.css('width', `${percent}%`).toggleClass('todo_progress_bar_complete', total > 0 && percent === 100);
    $('.todo_progress_bar_cont').attr({ 'aria-valuenow': percent, 'aria-valuetext': getCompletionPercentage(list) });
    todoListCompletionText.text(getCompletionPercentage(list));
    hideCompleteTodosBtn.toggle(Boolean(list && !list.hideComplete));
    showCompleteTodosBtn.toggle(Boolean(list?.hideComplete));
    const visibleTodos = list ? list.todos.filter((todo) => !list.hideComplete || !todo.checked) : [];
    todoItemCont.html(visibleTodos.length ? visibleTodos.map(createTodo).join('')
        : '<p class="todo_empty_state">' + (list?.todos.length ? 'All todos are complete. Show completed to see them.' : 'No todos yet. Add your first todo below.') + '</p>');
    todoItemCont.scrollTop(scrollTop);
};

// Apply one state change and save once. Failed saves leave the existing UI and data intact.
const commitTodoChange = (change, render = true) => {
    const previous = { lists: global_app_data.e_todos, lastActiveId: global_app_data.e_todos_lal };
    const next = structuredClone(previous);
    if (change(next) === false) return false;
    global_app_data.e_todos = next.lists;
    global_app_data.e_todos_lal = next.lastActiveId;
    try {
        saveToLocalStorage();
    } catch (error) {
        global_app_data.e_todos = previous.lists;
        global_app_data.e_todos_lal = previous.lastActiveId;
        sendNotification('fast', 5000, 'Your change could not be saved. Please try again.');
        return false;
    }
    if (render) renderTodoUi();
    return true;
};

const todoEditorContent = () => {
    const contentHtml = sanitizeRichTextMarkup(getTodoEditor().innerHTML);
    return { contentHtml, todo: plainTextFromRichText(contentHtml) };
};

const updateTodoComposerMode = () => {
    const hasContent = Boolean(todoEditorContent().todo);
    addNewTodoBtn.text(editingTodoTarget ? 'Save changes' : 'Add todo');
    $('#cancel_todo_edit_btn').prop('hidden', !editingTodoTarget && !hasContent)
        .text(editingTodoTarget ? 'Cancel' : 'Discard');
    setTodoStatus(editingTodoTarget ? 'Editing todo · Ctrl/Cmd + Enter to save' : 'Ctrl/Cmd + Enter to add');
};

const rememberTodoComposer = () => {
    const list = returncurrList();
    if (list) todoComposerDrafts.set(list.id, { html: getTodoEditor().innerHTML, target: editingTodoTarget });
};

const restoreTodoComposer = () => {
    const list = returncurrList();
    const draft = list && todoComposerDrafts.get(list.id);
    getTodoEditor().innerHTML = draft ? sanitizeRichTextMarkup(draft.html) : '';
    editingTodoTarget = draft?.target && findTodo(list, draft.target.todoId) ? draft.target : null;
    updateTodoComposerMode();
};

const resetTodoComposer = () => {
    const list = returncurrList();
    if (list) todoComposerDrafts.delete(list.id);
    getTodoEditor().innerHTML = '';
    editingTodoTarget = null;
    updateTodoComposerMode();
};

const closeTodoDueDate = (restoreFocus = true) => {
    $('#add_due_date_modal_cont').removeClass('modal_active');
    todoDueDateTarget = null;
    dueDateInputElm.val('');
    dueDateInputElm[0].setCustomValidity('');
    $('.chosen_due_date').text('');
    if (restoreFocus) getTodoEditor().focus();
};

const finishTodoListChange = () => {
    closeTodoDueDate(false);
    todoListTitle.prop('hidden', false);
    changeListTitleInput.prop('hidden', true);
    restoreTodoComposer();
};

const createTodoListAction = (value) => {
    let name;
    try { name = TodoModel.validateListName(value); }
    catch (error) { sendNotification('fast', 3000, error.message); return false; }
    rememberTodoComposer();
    const id = makeTodoId();
    if (!commitTodoChange((state) => {
        state.lastActiveId = TodoModel.activeList(state.lists)?.id || '';
        state.lists.push({ id, name, todos: [], active: false, hideComplete: false });
        TodoModel.activate(state.lists, id);
    })) return false;
    addFirstListInputElm.val('');
    addNewListInputElm.val('');
    showOrHideAddNewTodoListForm(false);
    finishTodoListChange();
    closeTodoMenu();
    getTodoEditor().focus();
    return true;
};

const saveTodoFromEditor = () => {
    const list = returncurrList();
    if (!list) return false;
    const content = todoEditorContent();
    try { TodoModel.validateTodoText(content.todo); }
    catch (error) { setTodoStatus(error.message); getTodoEditor().focus(); return false; }
    const target = editingTodoTarget;
    if (target && (target.listId !== list.id || !findTodo(list, target.todoId))) {
        setTodoStatus('This todo is no longer available. Cancel this edit to add a new todo.');
        return false;
    }
    if (!commitTodoChange((state) => {
        const updated = TodoModel.findList(state.lists, list.id);
        if (target) Object.assign(findTodo(updated, target.todoId), content);
        else updated.todos.push({ ...content, id: makeTodoId(), createdDate: new Date().toISOString(), dueDate: '', checked: false });
    })) return false;
    resetTodoComposer();
    if (!target) todoItemCont.scrollTop(todoItemCont[0].scrollHeight);
    getTodoEditor().focus();
    return true;
};

const startEditingTodo = (todoId) => {
    const list = returncurrList();
    const todo = findTodo(list, todoId);
    if (!todo) return;
    if (editingTodoTarget?.todoId === todo.id) { getTodoEditor().focus(); return; }
    if (editingTodoTarget || todoEditorContent().todo) {
        setTodoStatus('Save or discard the current draft before editing another todo.');
        getTodoEditor().focus();
        return;
    }
    editingTodoTarget = { listId: list.id, todoId: todo.id };
    getTodoEditor().innerHTML = richTextForEditor(todo.contentHtml ?? todo.todo, typeof todo.contentHtml === 'string' ? 'html' : 'text');
    updateTodoComposerMode();
    rememberTodoComposer();
    getTodoEditor().focus();
};

const todoCheckHandler = (id) => {
    const list = returncurrList();
    if (!findTodo(list, id)) return false;
    return commitTodoChange((state) => {
        const todo = findTodo(TodoModel.findList(state.lists, list.id), id);
        todo.checked = !todo.checked;
    });
};

const deleteTodo = (id) => {
    const list = returncurrList();
    if (!findTodo(list, id)) return false;
    if (!commitTodoChange((state) => {
        const updated = TodoModel.findList(state.lists, list.id);
        updated.todos = updated.todos.filter((todo) => TodoModel.key(todo.id) !== TodoModel.key(id));
    })) return false;
    if (editingTodoTarget?.todoId === TodoModel.key(id)) resetTodoComposer();
    return true;
};

const setCompletedTodosHidden = (hidden) => {
    const list = returncurrList();
    if (!list || list.hideComplete === hidden) return false;
    return commitTodoChange((state) => { TodoModel.findList(state.lists, list.id).hideComplete = hidden; });
};

const changeList = (id) => {
    const current = returncurrList();
    if (!TodoModel.findList(global_app_data.e_todos, id) || current?.id === TodoModel.key(id)) return false;
    rememberTodoComposer();
    if (!commitTodoChange((state) => {
        state.lastActiveId = current?.id || '';
        TodoModel.activate(state.lists, id);
    })) return false;
    finishTodoListChange();
    closeTodoMenu();
    return true;
};

const saveListName = (value, id) => {
    let name;
    try { name = TodoModel.validateListName(value); }
    catch (error) { sendNotification('fast', 3000, error.message); return false; }
    if (!TodoModel.findList(global_app_data.e_todos, id)) return false;
    return commitTodoChange((state) => { TodoModel.findList(state.lists, id).name = name; });
};

const deleteTodoList = (id) => {
    const list = TodoModel.findList(global_app_data.e_todos, id);
    if (!list) return false;
    const deletingCurrent = list.active;
    if (!commitTodoChange((state) => {
        state.lists = state.lists.filter((item) => item.id !== list.id);
        if (deletingCurrent && state.lists.length) {
            const fallback = TodoModel.findList(state.lists, state.lastActiveId) || state.lists[0];
            TodoModel.activate(state.lists, fallback.id);
        }
        if (!TodoModel.findList(state.lists, state.lastActiveId)) state.lastActiveId = '';
    })) return false;
    todoComposerDrafts.delete(list.id);
    if (deletingCurrent) finishTodoListChange();
    return true;
};

const openTodoDueDate = (todoId) => {
    const list = returncurrList();
    const todo = findTodo(list, todoId);
    if (!todo) return;
    todoDueDateTarget = { listId: list.id, todoId: todo.id };
    dueDateInputElm.val(todo.dueDate || '');
    dueDateInputElm[0].setCustomValidity('');
    $('.chosen_due_date').text(todo.dueDate ? `Current due date: ${TodoModel.formatDueDate(todo.dueDate)}` : 'No due date set.');
    $('#add_due_date_modal_cont').addClass('modal_active');
    dueDateInputElm.trigger('focus');
};

const saveTodoDueDate = (value = dueDateInputElm.val()) => {
    const target = todoDueDateTarget;
    if (!target || !findTodo(TodoModel.findList(global_app_data.e_todos, target.listId), target.todoId)) return false;
    if (value === '') dueDateInputElm.val('');
    dueDateInputElm[0].setCustomValidity(value !== '' && !TodoModel.parseDueDate(value) ? 'Choose a valid due date.' : '');
    if (!dueDateInputElm[0].reportValidity()) return false;
    if (!commitTodoChange((state) => {
        findTodo(TodoModel.findList(state.lists, target.listId), target.todoId).dueDate = value;
    })) return false;
    closeTodoDueDate();
    return true;
};

const createJsonExport = (list) => {
    if (!list) return false;
    const url = URL.createObjectURL(new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = (list.name.replace(/[^a-zA-Z0-9_-]/g, '-') || 'todo-list') + '.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return true;
};

const importJsonListData = (data) => {
    let list;
    try {
        list = TodoModel.parseImportedList(data);
        list.todos = list.todos.map((todo) => {
            if (typeof todo.contentHtml !== 'string') return todo;
            const contentHtml = sanitizeRichTextMarkup(todo.contentHtml);
            return { ...todo, contentHtml, todo: TodoModel.validateTodoText(plainTextFromRichText(contentHtml)) };
        });
    } catch (error) { sendNotification('fast', 5000, error.message); return false; }
    if (TodoModel.findList(global_app_data.e_todos, list.id)) {
        sendNotification('fast', 3000, 'This list has already been added.');
        return false;
    }
    rememberTodoComposer();
    if (!commitTodoChange((state) => {
        state.lastActiveId = TodoModel.activeList(state.lists)?.id || '';
        state.lists.push(list);
        TodoModel.activate(state.lists, list.id);
    })) return false;
    finishTodoListChange();
    closeTodoMenu();
    sendNotification('fast', 3000, `${list.name} list has been added.`);
    return true;
};

const loadTodoData = () => {
    const previous = JSON.stringify(global_app_data.e_todos);
    global_app_data.e_todos = TodoModel.normalizeLists(global_app_data.e_todos, makeTodoId, global_app_data.e_todos_lal);
    if (previous !== JSON.stringify(global_app_data.e_todos)) saveToLocalStorage();
    renderTodoUi();
    restoreTodoComposer();
};

const moveTodoWithKeyboard = (event, collection, attribute, items) => {
    if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const item = event.target.closest(`[${attribute}]`);
    const visibleIds = collection.children(items).map(function () { return this.getAttribute(attribute); }).get();
    const index = visibleIds.indexOf(item.getAttribute(attribute));
    const next = index + (event.key === 'ArrowUp' ? -1 : 1);
    if (index < 0 || next < 0 || next >= visibleIds.length) return;
    [visibleIds[index], visibleIds[next]] = [visibleIds[next], visibleIds[index]];
    const list = returncurrList();
    if (commitTodoChange((state) => {
        if (attribute === 'data-todoid') {
            const updated = TodoModel.findList(state.lists, list.id);
            updated.todos = TodoModel.reorder(updated.todos, visibleIds);
        } else state.lists = TodoModel.reorder(state.lists, visibleIds);
    })) {
        collection.children(items).filter(function () { return this.getAttribute(attribute) === item.getAttribute(attribute); })
            .find(attribute === 'data-todoid' ? '.todo_drag_handle' : '.todo_list_btn').trigger('focus');
    }
};

$(() => {
    if (!$('.tf_todo_tab_cont').length) return;
    loadTodoData();
    closeTodoMenu();

    addFirstListBtn.on('click', () => createTodoListAction(addFirstListInputElm.val()));
    addNewTodoListBtn.on('click', () => createTodoListAction(addNewListInputElm.val()));
    addFirstListInputElm.add(addNewListInputElm).on('keydown', function (event) {
        if (event.key === 'Enter' && !event.isComposing && !event.originalEvent?.isComposing) {
            event.preventDefault();
            createTodoListAction($(this).val());
        }
    });
    showAddNewTodoListFormBtn.on('click', () => showOrHideAddNewTodoListForm(true));
    cancelAddNewTodoListBtn.on('click', () => showOrHideAddNewTodoListForm(false));
    todoListMenuBtn.on('click', () => {
        if (todoMenuIsOpen) closeTodoMenu();
        else {
            todoMenu.prop('hidden', false).addClass('todo_list_menu_active');
            todoListMenuBtn.attr('aria-expanded', 'true');
            todoMenuIsOpen = true;
        }
    });
    $(document).on('click.todos', (event) => {
        if (todoMenuIsOpen && !$(event.target).closest('.todo_list_menu, .tf_todo_tab_cont .todo_list_nav_button').length) closeTodoMenu();
    });

    addNewTodoBtn.on('click', saveTodoFromEditor);
    $('#cancel_todo_edit_btn').on('click', () => { resetTodoComposer(); getTodoEditor().focus(); });
    addTodoInputElm.on('input', () => { rememberTodoComposer(); updateTodoComposerMode(); });
    addTodoInputElm.on('keydown', (event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing && !event.originalEvent?.isComposing) {
            event.preventDefault();
            saveTodoFromEditor();
        } else if (event.key === 'Escape' && editingTodoTarget) {
            event.preventDefault();
            resetTodoComposer();
        }
    });
    addTodoInputElm.on('paste drop', (event) => {
        event.preventDefault();
        getTodoEditor().focus();
        const source = event.originalEvent || event;
        const text = (source.clipboardData || source.dataTransfer)?.getData('text/plain') || '';
        if (text) insertPlainTextAtSelection(text);
        rememberTodoComposer();
        updateTodoComposerMode();
    });
    $('.todo_editor_toolbar').on('mousedown', '.todo_format_btn', (event) => event.preventDefault());
    $('.todo_editor_toolbar').on('click', '.todo_format_btn', function () {
        getTodoEditor().focus();
        document.execCommand(this.dataset.command, false, this.dataset.value || null);
        rememberTodoComposer();
        updateTodoComposerMode();
    });
    $(document).on('selectionchange.todos', () => {
        const selection = window.getSelection();
        if (!selection?.anchorNode || !getTodoEditor().contains(selection.anchorNode)) return;
        $('.todo_format_btn[aria-pressed]').each(function () {
            const pressed = document.queryCommandState(this.dataset.command);
            $(this).toggleClass('active', pressed).attr('aria-pressed', String(pressed));
        });
    });
    todoItemCont.on('click', '.todo_item_text', function (event) {
        if (!$(event.target).closest('a').length) startEditingTodo(this.getAttribute('data-todoid'));
    });
    todoItemCont.on('click', '.todo_edit_btn', function () { startEditingTodo(this.getAttribute('data-todoid')); });
    todoItemCont.on('change', '.complete_todo', function () {
        if (!todoCheckHandler(this.getAttribute('data-todoid'))) this.checked = !this.checked;
    });
    todoItemCont.on('click', '.todo_delete_btn', function () { deleteTodo(this.getAttribute('data-todoid')); });
    todoItemCont.on('click', '.todo_set_due_date_btn', function () { openTodoDueDate(this.getAttribute('data-todoid')); });
    hideCompleteTodosBtn.on('click', () => setCompletedTodosHidden(true));
    showCompleteTodosBtn.on('click', () => setCompletedTodosHidden(false));
    todoMenuListItemCont.on('click', '.todo_list_btn', function () { changeList(this.getAttribute('data-listid')); });
    todoMenuListItemCont.on('click', '.todo_list_delete_btn', function () { deleteTodoList(this.getAttribute('data-listid')); });
    todoMenuListItemCont.on('click', '.download_todo_list_btn', function () {
        createJsonExport(TodoModel.findList(global_app_data.e_todos, this.getAttribute('data-listid')));
    });
    todoItemCont.on('keydown', '.todo_drag_handle', (event) => moveTodoWithKeyboard(event, todoItemCont, 'data-todoid', '.todo_item'));
    todoMenuListItemCont.on('keydown', '.todo_list_btn', (event) => moveTodoWithKeyboard(event, todoMenuListItemCont, 'data-listid', '.todo_list_item'));

    todoListTitle.on('click keydown', (event) => {
        if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        const list = returncurrList();
        if (!list) return;
        changeListTitleInput.val(list.name).attr('data-listid', list.id).prop('hidden', false).trigger('focus');
        todoListTitle.prop('hidden', true);
    });
    changeListTitleInput.on('keydown', function (event) {
        if (event.isComposing || event.originalEvent?.isComposing) return;
        if (event.key === 'Enter') {
            event.preventDefault();
            if (!saveListName(this.value, this.getAttribute('data-listid'))) return;
        } else if (event.key !== 'Escape') return;
        changeListTitleInput.prop('hidden', true);
        todoListTitle.prop('hidden', false).trigger('focus');
    });

    $('#close_due_date_btn').on('click', () => closeTodoDueDate());
    dueDateInputElm.on('change input', () => {
        dueDateInputElm[0].setCustomValidity('');
        const date = dueDateInputElm.val();
        $('.chosen_due_date').text(date ? `Selected date: ${TodoModel.formatDueDate(date)}` : 'No due date set.');
    });
    saveDueDateBtn.on('click', () => saveTodoDueDate());
    $('#clear_due_date_btn').on('click', () => saveTodoDueDate(''));
    $(document).on('keydown.todos', (event) => {
        if (event.key === 'Escape') {
            closeTodoMenu();
            if (todoDueDateTarget) closeTodoDueDate();
        }
        if (event.key === 'Tab' && todoDueDateTarget) {
            const controls = $('#add_due_date_modal_cont').find('button, input').filter(':visible');
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });
    $('#import_todo_list_btn').on('click', () => $('#todo_list_import').trigger('click'));
    $('#todo_list_import').on('change', async (event) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        if (!file) return;
        try {
            if (file.size > TodoModel.MAX_IMPORT_BYTES) throw new Error('Choose a JSON file smaller than 1 MB.');
            importJsonListData(JSON.parse(await file.text()));
        } catch (error) {
            sendNotification('fast', 5000, error instanceof SyntaxError ? 'This file is not valid JSON.' : error.message);
        } finally { input.value = ''; }
    });
    todoItemCont.sortable({
        items: '> .todo_item', handle: '.todo_drag_handle', cancel: 'input, textarea, select, a, [contenteditable="true"], button:not(.todo_drag_handle)',
        tolerance: 'pointer', axis: 'y', containment: 'parent', cursor: 'grabbing',
        update() {
            const ids = $(this).sortable('toArray', { attribute: 'data-todoid' });
            const id = returncurrList()?.id;
            if (!id || !commitTodoChange((state) => {
                const list = TodoModel.findList(state.lists, id);
                list.todos = TodoModel.reorder(list.todos, ids);
            }, false)) $(this).sortable('cancel');
        },
    });
    todoMenuListItemCont.sortable({
        items: '> .todo_list_item', handle: '.todo_list_btn', cancel: 'button:not(.todo_list_btn)',
        tolerance: 'pointer', axis: 'y', containment: 'parent', cursor: 'grabbing',
        update() {
            const ids = $(this).sortable('toArray', { attribute: 'data-listid' });
            if (!commitTodoChange((state) => { state.lists = TodoModel.reorder(state.lists, ids); }, false)) $(this).sortable('cancel');
        },
    });
});
