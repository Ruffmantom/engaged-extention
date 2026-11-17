// Executed against the real popup DOM and bundled jQuery/jQuery UI in headless Chrome.
$(async () => {
    const results = [];
    const assert = (condition, message) => { if (!condition) throw new Error(message); };
    const equal = (actual, expected, message) => assert(JSON.stringify(actual) === JSON.stringify(expected), message || `${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
    const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
    const waitFor = async (condition) => {
        const deadline = Date.now() + 2000;
        while (!condition() && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 20));
        assert(condition(), 'Timed out waiting for an asynchronous UI action');
    };
    const saved = () => JSON.parse(localStorage.getItem('engage_app_data'));
    const setEditor = (html) => { getTodoEditor().innerHTML = html; addTodoInputElm.trigger('input'); };
    const add = (html) => { setEditor(html); assert(saveTodoFromEditor(), 'Todo should save'); return returncurrList().todos.at(-1); };
    const reset = () => {
        global_app_data.e_todos = [];
        global_app_data.e_todos_lal = '';
        todoComposerDrafts.clear();
        editingTodoTarget = null;
        getTodoEditor().innerHTML = '';
        $('.main_modal_container').removeClass('modal_active');
        closeTodoDueDate(false);
        closeTodoMenu();
        loadTodoData();
    };
    const check = async (name, callback) => {
        try { reset(); await callback(); results.push({ name, passed: true }); }
        catch (error) { results.push({ name, passed: false, error: error.stack }); }
    };

    await check('first list and todo creation work through Enter and button handlers', () => {
        addFirstListInputElm.val('  Work  ').trigger($.Event('keydown', { key: 'Enter' }));
        equal(returncurrList().name, 'Work');
        equal($('.main_todo_cont').css('display'), 'block');
        assert(createTodoListAction(' ') === false, 'Whitespace-only names must fail');
        setEditor('<b>Ship</b> this update');
        addNewTodoBtn.trigger('click');
        equal(returncurrList().todos.length, 1);
        equal(returncurrList().todos[0].todo, 'Ship this update');
        assert($('.todo_item_text b').length === 1, 'Formatting should render');
        equal(saved().e_todos[0].todos[0].todo, 'Ship this update');
        equal(getTodoEditor().innerHTML, '');
        assert(saveTodoFromEditor() === false, 'Empty todos must fail');
        equal(returncurrList().todos.length, 1);
    });

    await check('every formatting button operates on the todo editor without changing notes', () => {
        createTodoListAction('Formatting');
        const noteBefore = getNoteEditor().innerHTML;
        const cases = [['bold', 'b, strong'], ['italic', 'i, em'], ['underline', 'u'],
            ['insertUnorderedList', 'ul li'], ['insertOrderedList', 'ol li'], ['formatBlock', 'h3']];
        for (const [command, selector] of cases) {
            resetTodoComposer();
            setEditor('Formatted todo');
            getTodoEditor().focus();
            const range = document.createRange();
            range.selectNodeContents(getTodoEditor());
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            $(`.todo_format_btn[data-command="${command}"]`).trigger('mousedown').trigger('click');
            assert(getTodoEditor().querySelector(selector), `${command} should apply formatting`);
            assert(saveTodoFromEditor(), `${command} content should save`);
            const rendered = todoItemCont.children('.todo_item').last();
            assert(rendered.find(selector).length > 0, `${command} should survive saving and rendering`);
        }
        equal(getNoteEditor().innerHTML, noteBefore, 'Todo toolbar must not change note contents');
    });

    await check('editing, cancelling, multiline content, and IME input retain their expected behavior', () => {
        createTodoListAction('Editing');
        const item = add('Original');
        todoItemCont.find('.todo_edit_btn').trigger('click');
        equal(addNewTodoBtn.text(), 'Save changes');
        setEditor('<h3>Updated</h3><div>Second line</div>');
        const enter = $.Event('keydown', { key: 'Enter' });
        addTodoInputElm.trigger(enter);
        assert(!enter.isDefaultPrevented(), 'Enter should allow paragraphs and list items, matching notes');
        getTodoEditor().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, isComposing: true, bubbles: true, cancelable: true }));
        equal(returncurrList().todos[0].todo, 'Original', 'IME composition must not submit');
        addTodoInputElm.trigger($.Event('keydown', { key: 'Enter', ctrlKey: true }));
        equal(returncurrList().todos.length, 1);
        equal(returncurrList().todos[0].todo, 'Updated\nSecond line');
        startEditingTodo(item.id);
        setEditor('Discard this edit');
        $('#cancel_todo_edit_btn').trigger('click');
        equal(returncurrList().todos[0].todo, 'Updated\nSecond line');
        equal(getTodoEditor().innerHTML, '');
    });

    await check('drafts stay with their own list and do not overwrite another todo', () => {
        createTodoListAction('First');
        const first = returncurrList().id;
        const a = add('Task A');
        const b = add('Task B');
        startEditingTodo(a.id);
        setEditor('<i>Draft A</i>');
        startEditingTodo(b.id);
        equal(editingTodoTarget.todoId, a.id);
        assert($('#todo_editor_status').text().includes('Save or discard'), 'An existing draft should be protected');
        createTodoListAction('Second');
        const second = returncurrList().id;
        setEditor('New second-list draft');
        changeList(first);
        equal(editingTodoTarget.todoId, a.id);
        equal(plainTextFromRichText(getTodoEditor().innerHTML), 'Draft A');
        assert(saveTodoFromEditor(), 'Restored edit should save');
        equal(returncurrList().todos[0].todo, 'Draft A');
        equal(returncurrList().todos[1].todo, 'Task B');
        changeList(second);
        equal(plainTextFromRichText(getTodoEditor().innerHTML), 'New second-list draft');
        equal(editingTodoTarget, null);
    });

    await check('completion, progress, hidden tasks, and deletion stay synchronized', () => {
        createTodoListAction('Progress');
        const a = add('A');
        const b = add('B');
        todoItemCont.find('.complete_todo').first()[0].click();
        assert(returncurrList().todos[0].checked, 'Checkbox should update the model');
        equal(progressBarElm[0].style.width, '50%');
        equal($('.todo_progress_bar_cont').attr('aria-valuenow'), '50');
        setCompletedTodosHidden(true);
        equal(todoItemCont.children('.todo_item').length, 1);
        equal(returncurrList().todos.length, 2);
        todoCheckHandler(b.id);
        equal(todoItemCont.children('.todo_item').length, 0);
        assert(todoItemCont.find('.todo_empty_state').length, 'Hidden completed tasks should have an empty state');
        assert(progressBarElm.hasClass('todo_progress_bar_complete'), '100% should use the completion color');
        setCompletedTodosHidden(false);
        equal(todoItemCont.children('.todo_item').length, 2);
        deleteTodo(a.id);
        equal(todoItemCont.children('.todo_item').length, 1, 'Deletion must not depend on a CSS transition event');
        equal(saved().e_todos[0].todos.length, 1);
        deleteTodo(b.id);
        equal(progressBarElm[0].style.width, '0%');
        assert(!progressBarElm.hasClass('todo_progress_bar_complete'), 'An empty list must not count as complete');
    });

    await check('drag and keyboard reordering preserve hidden tasks and survive reloads', () => {
        createTodoListAction('Ordering');
        const a = add('A');
        const hidden = add('Hidden');
        const b = add('B');
        todoCheckHandler(hidden.id);
        setCompletedTodosHidden(true);
        todoItemCont.prepend(todoItemCont.children('.todo_item').last());
        todoItemCont.sortable('option', 'update').call(todoItemCont[0]);
        equal(returncurrList().todos.map((item) => item.id), [b.id, hidden.id, a.id]);
        loadTodoData();
        equal(returncurrList().todos.map((item) => item.id), [b.id, hidden.id, a.id]);
        const handle = todoItemCont.children('.todo_item').last().find('.todo_drag_handle');
        handle.trigger($.Event('keydown', { altKey: true, key: 'ArrowUp' }));
        equal(returncurrList().todos.map((item) => item.id), [a.id, hidden.id, b.id]);
        equal(document.activeElement.closest('.todo_item').dataset.todoid, a.id);
        equal(saved().e_todos[0].todos.length, 3);
        createTodoListAction('Second');
        const second = returncurrList().id;
        todoMenuListItemCont.prepend(todoMenuListItemCont.children('.todo_list_item').last());
        todoMenuListItemCont.sortable('option', 'update').call(todoMenuListItemCont[0]);
        equal(global_app_data.e_todos[0].id, second);
        assert(global_app_data.e_todos.every(Boolean), 'Reordered lists must not contain undefined entries');
    });

    await check('list switching, renaming, and deleting active or final lists keep a valid selection', () => {
        createTodoListAction('First');
        const first = returncurrList().id;
        createTodoListAction('Second');
        const second = returncurrList().id;
        todoListTitle.trigger('click');
        changeListTitleInput.val('Second renamed').trigger($.Event('keydown', { key: 'Enter' }));
        changeList(first);
        todoListTitle.trigger('click');
        changeListTitleInput.val('First renamed').trigger($.Event('keydown', { key: 'Enter' }));
        equal(TodoModel.findList(global_app_data.e_todos, second).name, 'Second renamed');
        equal(returncurrList().name, 'First renamed');
        assert(changeList('missing') === false, 'Unknown IDs must leave the selection alone');
        global_app_data.e_todos_lal = 'deleted-list';
        assert(deleteTodoList(first), 'Active list should delete even if its fallback ID is stale');
        equal(returncurrList().id, second);
        deleteTodoList(second);
        equal(returncurrList(), null);
        assert(startTodoListCont.is(':visible'), 'Deleting the last list should show the first-list form');
        createTodoListAction('Recovered');
        equal(returncurrList().name, 'Recovered');
    });

    await check('due dates save unchanged, reset between tasks, clear, and remain local calendar dates', () => {
        createTodoListAction('Dates');
        const a = add('A');
        const b = add('B');
        openTodoDueDate(a.id);
        dueDateInputElm.val('2026-01-31');
        saveDueDateBtn.trigger('click');
        equal(findTodo(returncurrList(), a.id).dueDate, '2026-01-31');
        openTodoDueDate(a.id);
        saveDueDateBtn.trigger('click');
        equal(findTodo(returncurrList(), a.id).dueDate, '2026-01-31', 'Saving without editing must preserve the date');
        openTodoDueDate(b.id);
        equal(dueDateInputElm.val(), '', 'Another task must not inherit the previous task date');
        dueDateInputElm.val('2026-12-31');
        $('#close_due_date_btn').trigger('click');
        equal(findTodo(returncurrList(), b.id).dueDate, '', 'Closing should discard the pending date');
        openTodoDueDate(a.id);
        $('#clear_due_date_btn').trigger('click');
        equal(findTodo(returncurrList(), a.id).dueDate, '');
        openTodoDueDate(a.id);
        createTodoListAction('Another list');
        equal(todoDueDateTarget, null, 'Changing lists should close the old date target');
    });

    await check('imports validate file contents, activate the first list, and escape untrusted names and text', async () => {
        const imported = { id: 4, name: '<img src=x onerror="window.todoXss=true">', todos: [
            { id: 7, todo: '<script>window.todoXss=true</script> https://example.com', checked: false, dueDate: '' },
            { id: 8, todo: 'Rich task', contentHtml: '<b>Rich task</b><img src=x onerror="window.todoXss=true"><script>window.todoXss=true</script><a href="javascript:alert(1)">safe</a>', checked: false, dueDate: '' },
        ] };
        assert(importJsonListData(imported), 'A valid list should import into an empty collection');
        equal(returncurrList().id, '4');
        equal(todoItemCont.children('.todo_item').length, 2);
        equal(todoItemCont.find('script, img, [onerror], a[href^="javascript:"]').length, 0);
        equal(todoMenuListItemCont.find('img').length, 0);
        assert(todoItemCont.find('a[rel="noopener noreferrer"]').length > 0, 'Links should be safe and clickable');
        assert(!window.todoXss, 'Untrusted content must not execute');
        assert(importJsonListData(imported) === false, 'Duplicate list IDs must be rejected');
        assert(importJsonListData({ id: 'bad', name: 'Bad', todos: [{}] }) === false, 'Malformed task records must be rejected');
        equal(global_app_data.e_todos.length, 1);
        const input = document.getElementById('todo_list_import');
        const transfer = new DataTransfer();
        transfer.items.add(new File(['not JSON'], 'bad.json', { type: 'application/json' }));
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await waitFor(() => input.value === '');
        equal(input.value, '', 'The file input must reset after invalid files');
        assert($('.notification').text().includes('valid JSON'), 'Invalid files should have a useful error');
    });

    await check('rendering does not save and failed saves retain the old model, output, and edit draft', () => {
        createTodoListAction('Saving');
        add('Existing');
        const originalSet = Storage.prototype.setItem;
        let writes = 0;
        try {
            Storage.prototype.setItem = function (...args) { writes++; return originalSet.apply(this, args); };
            renderTodoUi();
            equal(writes, 0, 'Rendering must not save or mutate storage');
            todoCheckHandler(returncurrList().todos[0].id);
            equal(writes, 1, 'One action should save once');
            const snapshot = JSON.stringify(global_app_data.e_todos);
            setEditor('<b>Unsaved draft</b>');
            Storage.prototype.setItem = () => { throw new Error('Quota exceeded'); };
            assert(saveTodoFromEditor() === false, 'A failed save must report failure');
            equal(JSON.stringify(global_app_data.e_todos), snapshot);
            equal(todoItemCont.children('.todo_item').length, 1);
            equal(plainTextFromRichText(getTodoEditor().innerHTML), 'Unsaved draft');
        } finally { Storage.prototype.setItem = originalSet; }
    });

    await check('exports release their download URL and preserve formatting', async () => {
        createTodoListAction('Export / test');
        add('<u>Formatted</u>');
        const originalCreate = URL.createObjectURL;
        const originalRevoke = URL.revokeObjectURL;
        const originalClick = HTMLAnchorElement.prototype.click;
        let blob;
        let clickedName;
        let revoked;
        try {
            URL.createObjectURL = (value) => { blob = value; return 'blob:todo-test'; };
            URL.revokeObjectURL = (value) => { revoked = value; };
            HTMLAnchorElement.prototype.click = function () { clickedName = this.download; };
            assert(createJsonExport(returncurrList()), 'Export should succeed');
            assert(clickedName.endsWith('.json') && !clickedName.includes('/'), 'Filename should be safe');
            const parsed = JSON.parse(await blob.text());
            equal(parsed.todos[0].contentHtml, '<u>Formatted</u>');
            await tick();
            equal(revoked, 'blob:todo-test');
        } finally {
            URL.createObjectURL = originalCreate;
            URL.revokeObjectURL = originalRevoke;
            HTMLAnchorElement.prototype.click = originalClick;
        }
    });

    await check('todo menu is isolated from the color palette and shares notes editor styling', () => {
        createTodoListAction('Menus');
        $('.color_pallet_download_btn').trigger('click');
        assert(!todoMenuIsOpen, 'Color palette controls must not open the todo list menu');
        todoListMenuBtn.trigger('click');
        assert(todoMenuIsOpen && todoMenu.is(':visible'), 'Todo menu should open');
        equal(todoListMenuBtn.attr('aria-expanded'), 'true');
        $(document.body).trigger('click');
        assert(!todoMenuIsOpen && todoMenu.prop('hidden'), 'Outside click should close the menu');
        equal(getComputedStyle(getTodoEditor()).minHeight, getComputedStyle(getNoteEditor()).minHeight);
        equal(getComputedStyle(document.querySelector('.todo_composer')).borderRadius, getComputedStyle(document.querySelector('.note_composer')).borderRadius);
    });

    reset();
    createTodoListAction('Launch checklist');
    const completed = add('<b>Review</b> the generator logic');
    add('<b>Test</b> every todo action');
    add('<h3>Before release</h3><ul><li>Check saved lists</li><li>Try the formatting toolbar</li></ul>');
    todoCheckHandler(completed.id);
    setEditor('Add your next todo here…');
    window.getSelection().removeAllRanges();
    document.body.setAttribute('data-todo-test-result', btoa(JSON.stringify({ results, errors: window.todoBrowserErrors || [] })));
});
