// Data rules shared by the todo UI and regression tests. These functions do not touch the DOM or storage.
const TodoModel = (() => {
    const MAX_LIST_NAME = 120;
    const MAX_TODO_TEXT = 20000;
    const MAX_IMPORT_BYTES = 1024 * 1024;
    const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
    const key = (id) => String(id);
    const validId = (id) => (typeof id === 'string' && id.trim() !== '')
        || (typeof id === 'number' && Number.isFinite(id));
    const findList = (lists, id) => lists.find((list) => key(list.id) === key(id)) || null;
    const activeList = (lists) => lists.find((list) => list.active === true) || null;

    const progress = (list) => {
        const total = list?.todos.length || 0;
        const completed = list ? list.todos.filter((todo) => todo.checked === true).length : 0;
        return { total, completed, remaining: total - completed, percent: total ? Math.floor(completed / total * 100) : 0 };
    };

    const parseDueDate = (value) => {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
        const [year, month, day] = value.split('-').map(Number);
        if (year < 1) return null;
        const date = new Date(0);
        date.setHours(0, 0, 0, 0);
        date.setFullYear(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
    };

    const dueDateStatus = (value, now = new Date()) => {
        const date = parseDueDate(value);
        if (!date) return 'na';
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime() ? 'today' : date < today ? 'overdue' : 'fine';
    };

    const formatDueDate = (value) => {
        const date = parseDueDate(value);
        return date ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' }) : '';
    };

    const activate = (lists, id) => {
        if (!findList(lists, id)) return false;
        lists.forEach((list) => { list.active = key(list.id) === key(id); });
        return true;
    };

    const normalizeLists = (value, makeId, preferredId = '') => {
        const listIds = new Set();
        const uniqueId = (id, used) => {
            let result = validId(id) ? key(id) : makeId();
            while (used.has(result)) result = makeId();
            used.add(result);
            return result;
        };
        const lists = (Array.isArray(value) ? value : []).filter(isRecord).map((list) => {
            const todoIds = new Set();
            return {
                ...list,
                id: uniqueId(list.id, listIds),
                name: typeof list.name === 'string' && list.name.trim() ? list.name.trim() : 'Untitled list',
                active: list.active === true,
                hideComplete: list.hideComplete === true,
                todos: (Array.isArray(list.todos) ? list.todos : []).filter(isRecord).map((todo) => ({
                    ...todo,
                    id: uniqueId(todo.id, todoIds),
                    todo: typeof todo.todo === 'string' ? todo.todo : '',
                    checked: todo.checked === true,
                    dueDate: parseDueDate(todo.dueDate) ? todo.dueDate : '',
                })),
            };
        });
        const selected = activeList(lists) || findList(lists, preferredId) || lists[0];
        if (selected) activate(lists, selected.id);
        return lists;
    };

    // Only reorder the supplied IDs. Hidden tasks keep their slots and cannot be lost.
    const reorder = (items, ids) => {
        const byId = new Map(items.map((item) => [key(item.id), item]));
        const seen = new Set();
        const ordered = [];
        ids.forEach((id) => {
            const normalized = key(id);
            if (byId.has(normalized) && !seen.has(normalized)) {
                seen.add(normalized);
                ordered.push(byId.get(normalized));
            }
        });
        let index = 0;
        return items.map((item) => seen.has(key(item.id)) ? ordered[index++] : item);
    };

    const validateListName = (value) => {
        if (typeof value !== 'string' || !value.trim()) throw new Error('Enter a list name.');
        if (value.trim().length > MAX_LIST_NAME) throw new Error(`List names can have up to ${MAX_LIST_NAME} characters.`);
        return value.trim();
    };

    const validateTodoText = (value) => {
        if (typeof value !== 'string' || !value.trim()) throw new Error('Enter a todo before saving.');
        if (value.length > MAX_TODO_TEXT) throw new Error(`Todos can have up to ${MAX_TODO_TEXT} characters.`);
        return value.trim();
    };

    const parseImportedList = (data) => {
        if (!isRecord(data) || !validId(data.id) || !Array.isArray(data.todos)) {
            throw new Error('Choose a todo list JSON file exported by this app.');
        }
        const name = validateListName(data.name);
        const ids = new Set();
        const todos = data.todos.map((todo) => {
            if (!isRecord(todo) || !validId(todo.id) || typeof todo.checked !== 'boolean'
                || (todo.dueDate !== undefined && todo.dueDate !== '' && !parseDueDate(todo.dueDate))
                || (todo.contentHtml !== undefined && typeof todo.contentHtml !== 'string')) {
                throw new Error('This file contains an invalid todo.');
            }
            const id = key(todo.id);
            if (ids.has(id)) throw new Error('This file contains duplicate todo IDs.');
            ids.add(id);
            return {
                ...todo,
                id,
                todo: validateTodoText(todo.todo),
                dueDate: todo.dueDate || '',
            };
        });
        return { ...data, id: key(data.id), name, todos, active: false, hideComplete: data.hideComplete === true };
    };

    return Object.freeze({
        MAX_LIST_NAME, MAX_TODO_TEXT, MAX_IMPORT_BYTES,
        key, findList, activeList, progress, activate, normalizeLists, reorder,
        parseDueDate, dueDateStatus, formatDueDate, validateListName, validateTodoText, parseImportedList,
    });
})();
