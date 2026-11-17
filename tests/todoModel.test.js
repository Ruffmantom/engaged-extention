const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const context = vm.createContext({});
vm.runInContext(readFileSync(path.join(__dirname, '../js/todoModel.js'), 'utf8') + '\n globalThis.model = TodoModel;', context);
const model = context.model;
const json = (value) => JSON.parse(JSON.stringify(value));
const todo = (id, checked = false) => ({ id, todo: `Task ${id}`, checked, dueDate: '' });
const list = (id, active = false) => ({ id, name: `List ${id}`, active, hideComplete: false, todos: [] });
const makeId = (() => { let id = 0; return () => `new-${++id}`; })();

test('progress separates numeric percentages from the human-readable status', () => {
    assert.deepEqual(json(model.progress(null)), { total: 0, completed: 0, remaining: 0, percent: 0 });
    assert.deepEqual(json(model.progress({ todos: [todo('a'), todo('b', true), todo('c', true)] })), {
        total: 3, completed: 2, remaining: 1, percent: 66,
    });
    assert.equal(model.progress({ todos: [todo('a', true)] }).percent, 100);
});

test('saved data recovers one active list when the previous selection is missing or ambiguous', () => {
    const source = [list('a'), list('b')];
    assert.equal(model.activeList(model.normalizeLists(source, makeId, 'b')).id, 'b');
    assert.equal(model.activeList(model.normalizeLists(source, makeId, 'deleted')).id, 'a');
    source.forEach((item) => { item.active = true; });
    const normalized = model.normalizeLists(source, makeId);
    assert.equal(normalized.filter((item) => item.active).length, 1);
    assert.equal(normalized[0].active, true);
    assert.deepEqual(json(model.normalizeLists(null, makeId)), []);
    assert.deepEqual(json(model.normalizeLists([null, false, []], makeId)), []);
});

test('normalization repairs IDs and record shapes without sorting or mutating the original data', () => {
    const source = [{ ...list(1, true), todos: [todo(1, true), todo('1'), todo('c')] }, { id: 1, todos: null }];
    const snapshot = JSON.stringify(source);
    const normalized = model.normalizeLists(source, makeId);
    assert.equal(JSON.stringify(source), snapshot);
    assert.equal(normalized[0].id, '1');
    assert.notEqual(normalized[0].id, normalized[1].id);
    assert.notEqual(normalized[0].todos[0].id, normalized[0].todos[1].id);
    assert.deepEqual(json(normalized[0].todos.map((item) => item.todo)), ['Task 1', 'Task 1', 'Task c']);
    assert.equal(normalized[0].todos[0].checked, true);
    assert.equal(normalized[1].name, 'Untitled list');
    assert.deepEqual(json(normalized[1].todos), []);
});

test('unknown list IDs cannot clear the active selection', () => {
    const lists = [list('a', true), list('b')];
    assert.equal(model.activate(lists, 'missing'), false);
    assert.equal(model.activeList(lists).id, 'a');
    assert.equal(model.activate(lists, 'b'), true);
    assert.equal(model.activeList(lists).id, 'b');
    assert.equal(lists.filter((item) => item.active).length, 1);
});

test('reordering visible todos preserves hidden todos and ignores duplicate or unknown IDs', () => {
    const items = [todo('a'), todo('hidden', true), todo('b'), todo('hidden-2', true), todo('c')];
    const ordered = model.reorder(items, ['c', 'b', 'missing', 'b', 'a']);
    assert.deepEqual(json(ordered.map((item) => item.id)), ['c', 'hidden', 'b', 'hidden-2', 'a']);
    assert.equal(ordered.length, items.length);
    assert.equal(ordered[1], items[1]);
    assert.deepEqual(items.map((item) => item.id), ['a', 'hidden', 'b', 'hidden-2', 'c']);
    assert.deepEqual(json(model.reorder(items, [])), items);
});

test('list and todo orders round-trip without dropping numeric IDs', () => {
    const items = [todo(1), todo(2), todo(3)];
    const ordered = model.reorder(items, ['3', '1', '2']);
    assert.deepEqual(json(ordered.map((item) => item.id)), [3, 1, 2]);
    const normalized = model.normalizeLists([{ ...list('a', true), todos: ordered }], makeId);
    assert.deepEqual(json(normalized[0].todos.map((item) => item.id)), ['3', '1', '2']);
});

test('due dates validate real calendar dates, including leap years and month boundaries', () => {
    for (const value of ['', null, 'invalid', '2026-2-01', '2026-02-29', '2026-04-31', '2026-00-01', '0000-01-01']) {
        assert.equal(model.parseDueDate(value), null);
    }
    for (const value of ['2024-02-29', '2026-01-31', '2026-12-31', '2027-01-01']) {
        const date = model.parseDueDate(value);
        assert.equal(date.getFullYear(), Number(value.slice(0, 4)));
        assert.equal(date.getMonth() + 1, Number(value.slice(5, 7)));
        assert.equal(date.getDate(), Number(value.slice(8)));
    }
    assert.equal(model.formatDueDate('invalid'), '');
});

test('due-date status uses the local calendar day and never shifts a month-end date', () => {
    const now = new Date(2026, 10, 16, 23, 59);
    assert.equal(model.dueDateStatus('2026-11-16', now), 'today');
    assert.equal(model.dueDateStatus('2026-11-15', now), 'overdue');
    assert.equal(model.dueDateStatus('2026-11-17', now), 'fine');
    assert.equal(model.dueDateStatus('', now), 'na');
    assert.equal(model.parseDueDate('2026-01-31').getDate(), 31);
});

test('empty names and todos are rejected and meaningful whitespace is retained inside text', () => {
    for (const text of ['', ' ', '\n\t']) {
        assert.throws(() => model.validateListName(text), /list name/);
        assert.throws(() => model.validateTodoText(text), /Enter a todo/);
    }
    assert.equal(model.validateListName('  Work  '), 'Work');
    assert.equal(model.validateTodoText('  first\nsecond  '), 'first\nsecond');
    assert.throws(() => model.validateListName('a'.repeat(121)), /120/);
    assert.throws(() => model.validateTodoText('a'.repeat(20001)), /20000/);
});

test('imports accept existing exports without trusting their active-list flag', () => {
    const exported = { ...list(7, true), name: '  Work  ', todos: [todo(4), { ...todo('b'), contentHtml: '<b>Task b</b>' }] };
    const snapshot = JSON.stringify(exported);
    const imported = model.parseImportedList(exported);
    assert.equal(JSON.stringify(exported), snapshot);
    assert.equal(imported.id, '7');
    assert.equal(imported.name, 'Work');
    assert.equal(imported.active, false);
    assert.equal(imported.todos[0].id, '4');
    assert.equal(imported.todos[1].contentHtml, '<b>Task b</b>');
});

test('imports reject malformed records, impossible dates, and duplicate identities', () => {
    const valid = { ...list('a'), todos: [todo('b')] };
    for (const data of [null, [], {}, { ...valid, name: ' ' }, { ...valid, id: '' }, { ...valid, todos: {} },
        { ...valid, todos: [null] }, { ...valid, todos: [{ ...todo('b'), todo: 42 }] },
        { ...valid, todos: [{ ...todo('b'), checked: 'false' }] },
        { ...valid, todos: [{ ...todo('b'), dueDate: '2026-02-30' }] },
        { ...valid, todos: [{ ...todo('b'), contentHtml: {} }] },
        { ...valid, todos: [todo(1), todo('1')] }]) {
        assert.throws(() => model.parseImportedList(data));
    }
});
