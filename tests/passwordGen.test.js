const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const readScript = (file) => readFileSync(path.join(projectRoot, file), 'utf8');
const scripts = ['js/libraries/wordList.js', 'js/variables.js', 'js/helpers.js', 'app.js', 'js/passwordGen.js']
    .map((file) => ({ file, source: readScript(file) }));

// Model only the controls used by the generator; run the real app/storage helpers.
const createGenerator = (storedData, crypto = webcrypto, hasControls = true) => {
    const elements = new Map();
    const readyCallbacks = [];
    const copyCalls = [];
    let storedValue = storedData === undefined ? null : JSON.stringify(storedData);

    const $ = (selector) => {
        if (typeof selector === 'function') {
            readyCallbacks.push(selector);
            return;
        }
        if (typeof selector !== 'string') return selector;
        if (!elements.has(selector)) {
            let value = '';
            const attributes = {};
            const properties = {};
            const handlers = new Map();
            const input = {
                validationMessage: '',
                reportedValidity: 0,
                setCustomValidity(message) { this.validationMessage = message; },
                reportValidity() { this.reportedValidity++; return this.validationMessage === ''; },
            };
            const element = {
                0: input,
                length: hasControls ? 1 : 0,
                selections: 0,
                val(next) {
                    if (next === undefined) return value;
                    value = String(next);
                    return this;
                },
                prop(key, next) {
                    if (next === undefined) return properties[key];
                    properties[key] = next;
                    return this;
                },
                attr(key, next) {
                    if (typeof key === 'object') Object.assign(attributes, key);
                    else if (next === undefined) return attributes[key];
                    else attributes[key] = next;
                    return this;
                },
                on(events, callback) {
                    events.split(' ').forEach((event) => {
                        if (!handlers.has(event)) handlers.set(event, []);
                        handlers.get(event).push(callback);
                    });
                    return this;
                },
                trigger(event) {
                    (handlers.get(event) || []).forEach((callback) => callback.call(input, {
                        target: input,
                        preventDefault() {},
                    }));
                    return this;
                },
                select() { this.selections++; return this; },
                text() { return this; },
                slideDown() { return this; },
                slideUp() { return this; },
            };
            elements.set(selector, element);
        }
        return elements.get(selector);
    };

    const context = vm.createContext({
        $, crypto,
        localStorage: {
            getItem: () => storedValue,
            setItem: (key, value) => {
                assert.equal(key, 'engage_app_data');
                storedValue = value;
            },
        },
        document: { execCommand: (command) => { copyCalls.push(command); return true; } },
        setTimeout: () => 0,
        clearTimeout() {},
    });
    // A regression to Math.random must fail, even if it otherwise looks random.
    vm.runInContext('Math.random = () => { throw new Error("Insecure randomness used"); };', context);
    scripts.forEach(({ file, source }) => vm.runInContext(source, context, { filename: file }));
    vm.runInContext('globalThis.generator = { makePassword, parsePasswordLength, getPasswordRandomIndex, findWordsToFit, wordList };', context);
    readyCallbacks.forEach((callback) => callback());
    return {
        ...context.generator,
        $, context, copyCalls,
        saved: () => JSON.parse(storedValue),
    };
};

const options = Array.from({ length: 16 }, (_, mask) => ({
    inc_readable: Boolean(mask & 1),
    inc_numbers: Boolean(mask & 2),
    inc_uppercase: Boolean(mask & 4),
    inc_special: Boolean(mask & 8),
}));

const assertPasswordOptions = (password, length, settings) => {
    assert.equal(password.length, length);
    assert.match(password, /^[a-zA-Z0-9!$)(\-_@*]+$/);
    assert.match(password, /[a-z]/);
    assert.equal(/[A-Z]/.test(password), settings.inc_uppercase);
    assert.equal(/[0-9]/.test(password), settings.inc_numbers);
    assert.equal(/[!$)(\-_@*]/.test(password), settings.inc_special);
};

const canSplitIntoWords = (text, words) => {
    const reachable = Array(text.length + 1).fill(false);
    reachable[0] = true;
    for (let end = 1; end <= text.length; end++) {
        for (let size = 3; size <= 9 && size <= end; size++) {
            if (reachable[end - size] && words.has(text.slice(end - size, end))) {
                reachable[end] = true;
                break;
            }
        }
    }
    return reachable[text.length];
};

test('all 16 option combinations work at every supported length', () => {
    const generator = createGenerator();
    const words = new Set(generator.wordList);
    for (const settings of options) {
        for (let length = 5; length <= 256; length++) {
            const password = generator.makePassword(length, settings);
            assertPasswordOptions(password, length, settings);
            if (settings.inc_readable) {
                const chunks = password.toLowerCase().split(/[^a-z]+/).filter(Boolean);
                assert.ok(chunks.length > 0);
                chunks.forEach((chunk) => assert.ok(canSplitIntoWords(chunk, words), 'Readable words must remain intact'));
            }
        }
    }
});

test('required categories survive even when random choices repeatedly select the same index', () => {
    for (const value of [0, 0x7fffffff]) {
        const generator = createGenerator(undefined, { getRandomValues: (buffer) => buffer.fill(value) });
        for (const settings of options) {
            for (const length of [5, 6, 7, 16, 255, 256]) {
                assertPasswordOptions(generator.makePassword(length, settings), length, settings);
            }
        }
    }
});

test('secure index selection rejects values in the uneven tail', () => {
    const values = [0xffffffff, 17];
    const generator = createGenerator(undefined, { getRandomValues: (buffer) => { buffer[0] = values.shift(); return buffer; } });
    assert.equal(generator.getPasswordRandomIndex(10), 7);
    assert.equal(values.length, 0);
    for (const size of [0, -1, 1.5, NaN, Infinity, 2 ** 32 + 1]) {
        assert.throws(() => generator.getPasswordRandomIndex(size), { name: 'RangeError' });
    }
});

test('length validation rejects blank, fractional, out-of-range, and malformed values', () => {
    const generator = createGenerator();
    for (const value of ['', ' ', 'abc', 'NaN', 'Infinity', '5.5', 4, 257, -5, 5.5, NaN, Infinity, null, undefined, true, [], {}]) {
        assert.equal(generator.parsePasswordLength(value), null);
        assert.throws(() => generator.makePassword(value), { name: 'RangeError' });
    }
    for (const value of [5, 16, 256, '5', '16', '256']) {
        assert.equal(generator.makePassword(value).length, Number(value));
    }
    assert.throws(() => generator.findWordsToFit(2), /whole words/);
});

test('fresh installs use 16 characters and existing valid lengths are preserved', () => {
    const fresh = createGenerator();
    assert.equal(fresh.$('#pass_char_num').val(), '16');
    assert.equal(fresh.saved().e_pass_length, 16);
    const existing = createGenerator({ e_pass_length: '5', e_password: 'previous-password' });
    assert.equal(existing.$('#pass_char_num').val(), '5');
    assert.equal(existing.saved().e_pass_length, 5);
    assert.equal(existing.$('#password_output').val(), 'previous-password');
});

test('missing or invalid persisted settings recover without changing unrelated data', () => {
    for (const e_pass_settings of [undefined, null, { inc_readable: true, inc_numbers: false, inc_uppercase: 'false' }]) {
        const generator = createGenerator({ e_pass_length: 'invalid', e_password: null, e_pass_settings, e_notes: ['keep this'] });
        const saved = generator.saved();
        assert.equal(saved.e_pass_length, 16);
        assert.equal(saved.e_password, '');
        assert.deepEqual(saved.e_notes, ['keep this']);
        assert.equal(saved.e_pass_settings.inc_uppercase, true);
        assert.equal(saved.e_pass_settings.inc_special, true);
        assert.equal(saved.e_pass_settings.inc_readable, Boolean(e_pass_settings?.inc_readable));
        assert.equal(saved.e_pass_settings.inc_numbers, e_pass_settings?.inc_numbers ?? true);
    }
});

test('checkbox changes persist and restore correctly for all combinations', () => {
    const selectors = {
        inc_readable: '#pass_gen_setting_readable',
        inc_special: '#pass_gen_setting_specials',
        inc_uppercase: '#pass_gen_setting_upper',
        inc_numbers: '#pass_gen_setting_nums',
    };
    for (const settings of options) {
        const generator = createGenerator();
        for (const [key, selector] of Object.entries(selectors)) {
            generator.$(selector).prop('checked', settings[key]).trigger('change');
        }
        assert.deepEqual(generator.saved().e_pass_settings, settings);
        const reopened = createGenerator(generator.saved());
        for (const [key, selector] of Object.entries(selectors)) {
            assert.equal(reopened.$(selector).prop('checked'), settings[key]);
        }
        reopened.$('#generate_password_btn').trigger('click');
        assertPasswordOptions(reopened.$('#password_output').val(), 16, settings);
    }
});

test('typing or pasting lengths saves valid values and generation rejects invalid edits', () => {
    const generator = createGenerator();
    const input = generator.$('#pass_char_num');
    generator.$('#generate_password_btn').trigger('click');
    const previousPassword = generator.saved().e_password;
    for (const invalid of ['', '4', '257', '5.5']) {
        input.val(invalid).trigger('input');
        generator.$('#generate_password_btn').trigger('click');
        assert.equal(generator.saved().e_pass_length, 16);
        assert.equal(generator.saved().e_password, previousPassword);
        assert.equal(generator.$('#password_output').val(), previousPassword);
        assert.equal(input.attr('aria-invalid'), 'true');
        assert.match(input[0].validationMessage, /whole number/);
    }
    assert.equal(input[0].reportedValidity, 4);
    input.val('25').trigger('input');
    assert.equal(generator.saved().e_pass_length, 25);
    assert.equal(input.attr('aria-invalid'), 'false');
    assert.equal(input[0].validationMessage, '');
    generator.$('#generate_password_btn').trigger('click');
    assert.equal(generator.saved().e_password.length, 25);
    // Generate reads the current control even before its next change event.
    input.val('32');
    generator.$('#generate_password_btn').trigger('click');
    assert.equal(generator.saved().e_password.length, 32);
    assert.equal(generator.saved().e_pass_length, 32);
    input.trigger('click');
    assert.equal(input.selections, 1);
});

test('generate, reopen, copy, and clear keep the output and storage in sync', () => {
    const generator = createGenerator();
    generator.$('#generate_password_btn').trigger('click');
    const password = generator.$('#password_output').val();
    assert.equal(generator.saved().e_password, password);
    const reopened = createGenerator(generator.saved());
    assert.equal(reopened.$('#password_output').val(), password);
    reopened.$('#password_output').trigger('click');
    assert.deepEqual(reopened.copyCalls, ['copy']);
    assert.equal(reopened.$('#password_output').selections, 1);
    reopened.$('#clear_output_btn').trigger('click');
    assert.equal(reopened.$('#password_output').val(), '');
    assert.equal(reopened.saved().e_password, '');
    reopened.$('#password_output').trigger('click');
    assert.deepEqual(reopened.copyCalls, ['copy']);
    assert.equal(createGenerator(reopened.saved()).$('#password_output').val(), '');
});

test('a random source failure leaves the existing password untouched', () => {
    const generator = createGenerator({ e_pass_length: 16, e_password: 'keep-this-password' }, {
        getRandomValues() { throw new Error('Random source unavailable'); },
    });
    generator.$('#generate_password_btn').trigger('click');
    assert.equal(generator.$('#password_output').val(), 'keep-this-password');
    assert.equal(generator.saved().e_password, 'keep-this-password');
});

test('injected scripts skip initialization on pages without generator controls', () => {
    const generator = createGenerator(undefined, webcrypto, false);
    assert.equal(generator.$('#pass_char_num').attr('min'), undefined);
    generator.$('#generate_password_btn').trigger('click');
    assert.equal(generator.saved().e_password, '');
});
