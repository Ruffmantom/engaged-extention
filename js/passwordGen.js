const PASSWORD_MIN_LENGTH = 5;
const PASSWORD_MAX_LENGTH = 256;
const PASSWORD_LENGTH_MESSAGE = `Enter a whole number from ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH}.`;

const passwordSettingControls = [
    { element: pass_gen_setting_readable, key: 'inc_readable' },
    { element: pass_gen_setting_specials, key: 'inc_special' },
    { element: pass_gen_setting_upper, key: 'inc_uppercase' },
    { element: pass_gen_setting_nums, key: 'inc_numbers' },
];

const parsePasswordLength = (value) => {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    if (typeof value === 'string' && value.trim() === '') return null;

    const length = Number(value);
    return Number.isInteger(length) && length >= PASSWORD_MIN_LENGTH && length <= PASSWORD_MAX_LENGTH
        ? length
        : null;
};

// Reject the uneven tail of the uint32 range so every index is equally likely.
const getPasswordRandomIndex = (size) => {
    const range = 2 ** 32;
    if (!Number.isInteger(size) || size < 1 || size > range) {
        throw new RangeError('A password character pool must have a valid size.');
    }
    const limit = range - (range % size);
    const value = new Uint32Array(1);
    do {
        crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % size;
};

const pickPasswordCharacter = (pool) => pool[getPasswordRandomIndex(pool.length)];

const shufflePasswordItems = (items) => {
    for (let i = items.length - 1; i > 0; i--) {
        const j = getPasswordRandomIndex(i + 1);
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
};

const getPasswordCharacterPools = (settings) => {
    const pools = [chars];
    if (settings.inc_uppercase) pools.push(upperChars);
    if (settings.inc_numbers) pools.push(numChars);
    if (settings.inc_special) pools.push(specialChars);
    return pools;
};

const makeRandomPassword = (length, settings) => {
    const pools = getPasswordCharacterPools(settings);
    const allowedCharacters = pools.join('');
    // Reserve one character per enabled category before filling and shuffling.
    const password = pools.map(pickPasswordCharacter);
    while (password.length < length) {
        password.push(pickPasswordCharacter(allowedCharacters));
    }
    return shufflePasswordItems(password).join('');
};

const readableWordLengths = [...new Set(wordList.map((word) => word.length))];

const findWordsToFit = (length) => {
    // Track fillable lengths to avoid leaving one or two unfillable characters.
    const canFill = Array(length + 1).fill(false);
    canFill[0] = true;
    for (let remaining = 1; remaining <= length; remaining++) {
        canFill[remaining] = readableWordLengths.some((size) => size <= remaining && canFill[remaining - size]);
    }
    if (!canFill[length]) {
        throw new Error('Readable passwords need enough room for whole words and the selected options.');
    }

    const words = [];
    let remaining = length;
    while (remaining > 0) {
        const candidates = wordList.filter((word) => word.length <= remaining && canFill[remaining - word.length]);
        const word = candidates[getPasswordRandomIndex(candidates.length)];
        words.push(word);
        remaining -= word.length;
    }
    return words;
};

const makeReadablePassword = (length, settings) => {
    const extras = [];
    if (settings.inc_numbers) extras.push(pickPasswordCharacter(numChars));
    if (settings.inc_special) extras.push(pickPasswordCharacter(specialChars));

    const words = findWordsToFit(length - extras.length).map((word) => {
        if (!settings.inc_uppercase) return word;
        const index = getPasswordRandomIndex(word.length);
        return word.slice(0, index) + word[index].toUpperCase() + word.slice(index + 1);
    });

    // Insert extra characters at word boundaries to keep each word intact.
    shufflePasswordItems(extras).forEach((character) => {
        words.splice(getPasswordRandomIndex(words.length + 1), 0, character);
    });
    return words.join('');
};

const makePassword = (value, settings = global_app_data.e_pass_settings) => {
    const length = parsePasswordLength(value);
    if (length === null) throw new RangeError(PASSWORD_LENGTH_MESSAGE);
    return settings.inc_readable
        ? makeReadablePassword(length, settings)
        : makeRandomPassword(length, settings);
};

const validatePasswordLength = () => {
    const length = parsePasswordLength(passwordLength.val());
    passwordLength[0].setCustomValidity(length === null ? PASSWORD_LENGTH_MESSAGE : '');
    passwordLength.attr('aria-invalid', length === null ? 'true' : 'false');
    return length;
};

const generatePasswordOutput = () => {
    const length = validatePasswordLength();
    if (length === null) {
        passwordLength[0].reportValidity();
        return;
    }

    let password;
    try {
        password = makePassword(length);
    } catch (error) {
        sendNotification('', 5000, 'Unable to generate a password. ' + error.message);
        return;
    }
    passwordOutput.val(password);
    global_app_data.e_pass_length = length;
    global_app_data.e_password = password;
    saveToLocalStorage();
};

const loadPasswordSettings = () => {
    const storedSettings = global_app_data.e_pass_settings || {};
    global_app_data.e_pass_settings = { ...global_app_default_data.e_pass_settings, ...storedSettings };
    passwordSettingControls.forEach(({ element, key }) => {
        if (typeof global_app_data.e_pass_settings[key] !== 'boolean') {
            global_app_data.e_pass_settings[key] = global_app_default_data.e_pass_settings[key];
        }
        element.prop('checked', global_app_data.e_pass_settings[key]);
    });
};

const loadPasswordGenerator = () => {
    global_app_data.e_pass_length = parsePasswordLength(global_app_data.e_pass_length)
        ?? global_app_default_data.e_pass_length;
    global_app_data.e_password = typeof global_app_data.e_password === 'string' ? global_app_data.e_password : '';
    passwordLength.attr({ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH, step: 1, required: true });
    passwordLength.val(global_app_data.e_pass_length);
    loadPasswordSettings();
    passwordOutput.val(global_app_data.e_password);
    validatePasswordLength();
    saveToLocalStorage();
};

$(() => {
    // Initialize only when the password generator controls are present.
    if (!passwordLength.length) return;
    loadPasswordGenerator();

    passwordLength.on('click', () => passwordLength.select());
    passwordLength.on('input change', () => {
        const length = validatePasswordLength();
        if (length !== null) {
            global_app_data.e_pass_length = length;
            saveToLocalStorage();
        }
    });
    generatePassBtn.on('click', generatePasswordOutput);

    passwordOutput.on('click', (event) => {
        event.preventDefault();
        copyFunction('#password_output');
    });
    clearPassOutputBtn.on('click', (event) => {
        event.preventDefault();
        passwordOutput.val('');
        global_app_data.e_password = '';
        saveToLocalStorage();
    });

    passwordSettingControls.forEach(({ element, key }) => {
        element.on('change', () => {
            global_app_data.e_pass_settings[key] = element.prop('checked');
            saveToLocalStorage();
        });
    });
});
