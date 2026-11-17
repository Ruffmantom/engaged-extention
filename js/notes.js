let editingNoteId = null;
let noteVaultKey = null;
let unlockedHiddenNotes = new Map();
let revealedHiddenNoteIds = new Set();
let pendingHiddenNoteId = null;
let pendingVaultHideNoteId = null;
let pendingRevealNoteId = null;
let noteVaultExpiresAt = 0;
let noteVaultTimer = null;
let noteVaultUnlocking = false;
let hiddenNoteRevealSequence = 0;

const NOTE_VAULT_CHECK = 'stay-engaged-notes-vault-check-v1';
const NOTE_VAULT_ITERATIONS = 600000;
const NOTE_VAULT_MAX_ITERATIONS = 1000000;
const NOTE_VAULT_GRACE_MS = 60 * 1000;

const noteKeyForId = (noteId) => String(noteId);
const noteComposerModal = $('#note_composer_modal_cont');
const openNoteComposerButton = $('#open_note_composer_btn');

const getNoteEditor = () => noteInputElm[0];
const getNoteTitle = () => String(noteTitleInputElm.val() || '').trim().slice(0, 80);

const openNoteComposerModal = (focusTarget = noteTitleInputElm[0]) => {
    noteComposerModal.addClass('modal_active');
    if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
};

const closeNoteComposerModal = (restoreFocus = true) => {
    noteComposerModal.removeClass('modal_active');
    if (restoreFocus) openNoteComposerButton.trigger('focus');
};

const setNoteListStatus = (message) => $('#note_list_status').text(message);

const ensureNoteStaging = () => {
    if (!global_app_data.stagingDefault || typeof global_app_data.stagingDefault !== 'object') {
        global_app_data.stagingDefault = { editing: false, text: '' };
    }
    return global_app_data.stagingDefault;
};

const ensureNoteCollection = () => {
    if (!Array.isArray(global_app_data.e_notes)) global_app_data.e_notes = [];
};

const getSafeNoteContent = () => sanitizeNoteMarkup(getNoteEditor().innerHTML);

const noteHasContent = (markup) => {
    const template = document.createElement('template');
    template.innerHTML = sanitizeNoteMarkup(markup);
    return template.content.textContent.replace(/\u00a0/g, ' ').trim().length > 0;
};

const noteDraftHasContent = (markup, title) => noteHasContent(markup) || Boolean(String(title || '').trim());

const setEditorContent = (markup) => {
    getNoteEditor().innerHTML = sanitizeNoteMarkup(markup);
};

const updateNoteFormMode = (isEditing, hasDraft = false) => {
    addNoteBtn.text(isEditing ? 'Save changes' : 'Save note');
    $('#note_composer_modal_title').text(isEditing ? 'Edit note' : 'Create note');
    $('#cancel_note_edit_btn')
        .text(isEditing ? 'Cancel' : 'Discard')
        .prop('hidden', !isEditing && !hasDraft);
    $('#note_editor_status').text(isEditing ? 'Editing note' : '');
};

const saveNoteDraft = () => {
    const staging = ensureNoteStaging();
    const content = getSafeNoteContent();
    const title = noteTitleInputElm.val();
    staging.text = content;
    staging.title = title;
    staging.format = 'html';
    staging.editing = noteDraftHasContent(content, title);
    staging.noteId = editingNoteId;
    saveToLocalStorage();
};

const clearNoteDraft = () => {
    const staging = ensureNoteStaging();
    staging.text = '';
    staging.title = '';
    staging.format = 'html';
    staging.editing = false;
    delete staging.noteId;
    saveToLocalStorage();
};

const getHiddenNoteRecords = () => global_app_data.e_notes.filter((note) => note.isEncrypted === true);

const noteDataForDisplay = (noteRecord) => {
    if (noteRecord.isEncrypted !== true) return noteRecord;
    const isRevealed = noteVaultKey && Date.now() < noteVaultExpiresAt && revealedHiddenNoteIds.has(noteKeyForId(noteRecord.id));
    if (!isRevealed) return noteRecord;

    const unlockedNote = unlockedHiddenNotes.get(noteKeyForId(noteRecord.id));
    return unlockedNote
        ? { ...unlockedNote, title: noteRecord.title, isHidden: true, isRevealed: true }
        : noteRecord;
};

const renderNoteList = () => {
    noteListContainer.empty();
    global_app_data.e_notes.forEach((note) => {
        noteListContainer.append(createNote(noteDataForDisplay(note)));
    });
};

const renderNoteCard = (noteId) => {
    const noteRecord = global_app_data.e_notes.find((note) => String(note.id) === String(noteId));
    if (!noteRecord) return;

    const replacement = $(createNote(noteDataForDisplay(noteRecord)));
    const existingCard = noteListContainer.children('.user_note').filter(function () {
        return this.dataset.noteid === String(noteId);
    });
    if (existingCard.length) existingCard.replaceWith(replacement);
    else noteListContainer.prepend(replacement);
};

const createNewNote = () => {
    const noteContent = getSafeNoteContent();
    const title = getNoteTitle();
    if (!noteDraftHasContent(noteContent, title)) {
        $('#note_editor_status').text('Add a title or note text before saving.');
        getNoteEditor().focus();
        return;
    }

    const noteData = {
        id: createId(),
        title,
        note: noteContent,
        contentFormat: 'html',
        label: '',
        dateCreated: new Date().toISOString()
    };
    global_app_data.e_notes.unshift(noteData);
    saveToLocalStorage();
    noteListContainer.prepend(createNote(noteData));
    resetNoteComposer();
};

const updateNote = () => {
    const noteData = global_app_data.e_notes.find((note) => note.id === editingNoteId && note.isEncrypted !== true);
    if (!noteData) {
        resetNoteComposer();
        return;
    }

    const noteContent = getSafeNoteContent();
    const title = getNoteTitle();
    if (!noteDraftHasContent(noteContent, title)) {
        $('#note_editor_status').text('Add a title or note text before saving.');
        getNoteEditor().focus();
        return;
    }

    noteData.title = title;
    noteData.note = noteContent;
    noteData.contentFormat = 'html';
    noteData.dateUpdated = new Date().toISOString();
    saveToLocalStorage();
    renderNoteCard(noteData.id);
    resetNoteComposer();
};

const resetNoteComposer = () => {
    editingNoteId = null;
    getNoteEditor().innerHTML = '';
    noteTitleInputElm.val('');
    clearNoteDraft();
    updateNoteFormMode(false);
    closeNoteComposerModal();
};

const startEditingNote = (noteId) => {
    if (editingNoteId) {
        if (String(editingNoteId) !== String(noteId)) {
            $('#note_editor_status').text('Save or cancel the current edit first.');
            openNoteComposerModal(getNoteEditor());
            return;
        }
        openNoteComposerModal(getNoteEditor());
        return;
    }
    if (noteDraftHasContent(getSafeNoteContent(), getNoteTitle())) {
        $('#note_editor_status').text('Save or discard this draft before editing a saved note.');
        openNoteComposerModal(getNoteEditor());
        return;
    }

    const noteData = global_app_data.e_notes.find((note) => String(note.id) === String(noteId) && note.isEncrypted !== true);
    if (!noteData) return;

    editingNoteId = noteData.id;
    noteTitleInputElm.val(noteData.title || '');
    setEditorContent(noteContentForEditor(noteData));
    updateNoteFormMode(true);
    saveNoteDraft();
    openNoteComposerModal(getNoteEditor());
};

const loadNoteData = () => {
    const staging = ensureNoteStaging();
    if (staging.noteId) {
        const editingNote = global_app_data.e_notes.find((note) => note.id === staging.noteId && note.isEncrypted !== true);
        if (editingNote) {
            editingNoteId = editingNote.id;
            noteTitleInputElm.val(typeof staging.title === 'string' ? staging.title : editingNote.title || '');
            const editorContent = typeof staging.text === 'string'
                ? staging.text
                : noteContentForEditor(editingNote);
            setEditorContent(editorContent);
            updateNoteFormMode(true);
            return;
        }
    }

    editingNoteId = null;
    noteTitleInputElm.val(typeof staging.title === 'string' ? staging.title : '');
    if (staging.editing && staging.text) {
        if (staging.format === 'html') {
            setEditorContent(staging.text);
        } else {
            setEditorContent(noteContentForEditor({ note: staging.text, contentFormat: 'text' }));
        }
    }
    updateNoteFormMode(false, noteDraftHasContent(getSafeNoteContent(), noteTitleInputElm.val()));
};

const deleteNote = (noteId) => {
    const index = global_app_data.e_notes.findIndex((note) => String(note.id) === String(noteId) && note.isEncrypted !== true);
    if (index === -1) return;

    global_app_data.e_notes.splice(index, 1);
    saveToLocalStorage();
    if (String(editingNoteId) === String(noteId)) resetNoteComposer();

    const noteCard = noteListContainer.children('.user_note').filter(function () {
        return this.dataset.noteid === String(noteId);
    });
    noteCard.addClass('deleted_note');
    setTimeout(() => noteCard.remove(), 160);
};

const bytesToBase64 = (bytes) => {
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return window.btoa(binary);
};

const base64ToBytes = (value) => {
    const binary = window.atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const deriveNoteVaultKey = async (password, salt, iterations) => {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error('Secure encryption is not available in this browser context.');
    }
    if (!Number.isInteger(iterations) || iterations < 100000 || iterations > NOTE_VAULT_MAX_ITERATIONS) {
        throw new Error('The hidden notes vault settings are invalid.');
    }

    const passwordKey = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
};

const encryptNoteVaultValue = async (key, value) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(value));
    const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
    return { iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(ciphertext)) };
};

const decryptNoteVaultValue = async (key, encryptedValue) => {
    const plaintext = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToBytes(encryptedValue.iv) },
        key,
        base64ToBytes(encryptedValue.ciphertext)
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
};

const getExplicitNoteTitle = (noteData) => String(noteData.title || '').trim().slice(0, 80);
const getResolvedNoteTitle = (noteData) => getExplicitNoteTitle(noteData) || 'Hidden note';

const createEncryptedNoteRecord = async (noteData, key) => {
    const title = getExplicitNoteTitle(noteData);
    if (!title) throw new Error('Add a title before hiding this note.');

    const encryptedValue = await encryptNoteVaultValue(key, {
        id: noteData.id,
        note: noteData.note,
        contentFormat: noteData.contentFormat || 'text',
        label: noteData.label || '',
        dateCreated: noteData.dateCreated,
        dateUpdated: noteData.dateUpdated || ''
    });
    return {
        id: noteData.id,
        title,
        dateCreated: noteData.dateCreated,
        dateUpdated: noteData.dateUpdated || '',
        isEncrypted: true,
        ...encryptedValue
    };
};

const setupNoteVaultAndHideNote = async (noteId, password) => {
    const noteIndex = global_app_data.e_notes.findIndex((note) => String(note.id) === String(noteId) && note.isEncrypted !== true);
    if (noteIndex === -1) throw new Error('That note is no longer available.');

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveNoteVaultKey(password, salt, NOTE_VAULT_ITERATIONS);
    const check = await encryptNoteVaultValue(key, NOTE_VAULT_CHECK);
    const oldNote = global_app_data.e_notes[noteIndex];
    const encryptedNote = await createEncryptedNoteRecord(oldNote, key);
    const oldVault = global_app_data.e_notes_vault;

    global_app_data.e_notes[noteIndex] = encryptedNote;
    global_app_data.e_notes_vault = {
        version: 1,
        kdf: 'PBKDF2-SHA-256',
        iterations: NOTE_VAULT_ITERATIONS,
        salt: bytesToBase64(salt),
        check
    };
    try {
        saveToLocalStorage();
    } catch (error) {
        global_app_data.e_notes[noteIndex] = oldNote;
        global_app_data.e_notes_vault = oldVault;
        throw error;
    }

    noteVaultKey = key;
    refreshNoteVaultSession();
    closeNoteVaultSetup(false);
    renderNoteList();
};

const hideNoteWithUnlockedVault = async (noteId) => {
    if (!hasActiveNoteVaultSession()) return false;
    const noteIndex = global_app_data.e_notes.findIndex((note) => String(note.id) === String(noteId) && note.isEncrypted !== true);
    if (noteIndex === -1) return false;

    const noteData = global_app_data.e_notes[noteIndex];
    const encryptedNote = await createEncryptedNoteRecord(noteData, noteVaultKey);
    global_app_data.e_notes[noteIndex] = encryptedNote;
    try {
        saveToLocalStorage();
    } catch (error) {
        global_app_data.e_notes[noteIndex] = noteData;
        throw error;
    }

    revealedHiddenNoteIds.delete(noteKeyForId(noteData.id));
    renderNoteCard(noteData.id);
    return true;
};

const hasActiveNoteVaultSession = () => {
    if (!noteVaultKey) return false;
    if (Date.now() < noteVaultExpiresAt) return true;
    expireNoteVaultSession();
    return false;
};

const refreshNoteVaultSession = () => {
    if (noteVaultTimer) clearTimeout(noteVaultTimer);
    noteVaultExpiresAt = Date.now() + NOTE_VAULT_GRACE_MS;
    noteVaultTimer = setTimeout(expireNoteVaultSession, NOTE_VAULT_GRACE_MS);
};

const expireNoteVaultSession = () => {
    hiddenNoteRevealSequence += 1;
    if (noteVaultTimer) clearTimeout(noteVaultTimer);
    noteVaultTimer = null;
    noteVaultKey = null;
    noteVaultExpiresAt = 0;
    unlockedHiddenNotes.clear();
    revealedHiddenNoteIds.clear();
    renderNoteList();
};

const lockNoteVaultSession = () => {
    hiddenNoteRevealSequence += 1;
    if (noteVaultTimer) clearTimeout(noteVaultTimer);
    noteVaultTimer = null;
    noteVaultKey = null;
    noteVaultExpiresAt = 0;
    unlockedHiddenNotes.clear();
    revealedHiddenNoteIds.clear();
    pendingVaultHideNoteId = null;
    pendingRevealNoteId = null;
    if (!$('#note_vault_unlock_modal').prop('hidden')) closeNoteVaultUnlock(false);
    renderNoteList();
};

const revealHiddenNote = async (noteId) => {
    if (!hasActiveNoteVaultSession()) return false;
    const record = global_app_data.e_notes.find((note) => String(note.id) === String(noteId) && note.isEncrypted === true);
    if (!record) return false;

    // Keep only one hidden note revealed in the list at a time.
    const revealSequence = ++hiddenNoteRevealSequence;
    unlockedHiddenNotes.clear();
    revealedHiddenNoteIds.clear();
    renderNoteList();
    const key = noteVaultKey;
    let noteData = unlockedHiddenNotes.get(noteKeyForId(record.id));
    if (!noteData) {
        noteData = await decryptNoteVaultValue(key, record);
        if (revealSequence !== hiddenNoteRevealSequence) return false;
        if (String(noteData.id) !== String(record.id) || !hasActiveNoteVaultSession() || noteVaultKey !== key) {
            throw new Error('The hidden note could not be opened.');
        }
        if (!record.title) {
            record.title = getResolvedNoteTitle(noteData);
            saveToLocalStorage();
        }
        noteData.title = record.title;
        unlockedHiddenNotes.set(noteKeyForId(record.id), noteData);
    }

    if (revealSequence !== hiddenNoteRevealSequence || !hasActiveNoteVaultSession() || noteVaultKey !== key) return false;
    revealedHiddenNoteIds.add(noteKeyForId(record.id));
    refreshNoteVaultSession();
    renderNoteList();
    return true;
};

const maskHiddenNote = (noteId) => {
    revealedHiddenNoteIds.delete(noteKeyForId(noteId));
    unlockedHiddenNotes.delete(noteKeyForId(noteId));
    renderNoteCard(noteId);
};

const unhideNote = (noteId) => {
    if (!hasActiveNoteVaultSession()) return;
    const noteKey = noteKeyForId(noteId);
    const noteData = unlockedHiddenNotes.get(noteKey);
    const encryptedIndex = global_app_data.e_notes.findIndex((note) => String(note.id) === String(noteId) && note.isEncrypted === true);
    if (!noteData || encryptedIndex === -1) return;

    const encryptedRecord = global_app_data.e_notes[encryptedIndex];
    global_app_data.e_notes.splice(encryptedIndex, 1);
    global_app_data.e_notes.unshift(noteData);
    try {
        saveToLocalStorage();
    } catch (error) {
        global_app_data.e_notes.shift();
        global_app_data.e_notes.splice(encryptedIndex, 0, encryptedRecord);
        setNoteListStatus('The note could not be restored.');
        return;
    }

    unlockedHiddenNotes.delete(noteKey);
    revealedHiddenNoteIds.delete(noteKey);
    renderNoteList();
};

const deleteHiddenNote = (noteId) => {
    const encryptedIndex = global_app_data.e_notes.findIndex((note) => String(note.id) === String(noteId) && note.isEncrypted === true);
    if (encryptedIndex === -1) return;

    const [record] = global_app_data.e_notes.splice(encryptedIndex, 1);
    try {
        saveToLocalStorage();
    } catch (error) {
        global_app_data.e_notes.splice(encryptedIndex, 0, record);
        setNoteListStatus('The hidden note could not be deleted.');
        return;
    }

    unlockedHiddenNotes.delete(noteKeyForId(noteId));
    revealedHiddenNoteIds.delete(noteKeyForId(noteId));
    renderNoteCard(noteId);
};

const openNoteVaultSetup = (noteId) => {
    pendingHiddenNoteId = noteId;
    $('#note_vault_setup_message').text('');
    $('#note_vault_new_password, #note_vault_confirm_password').val('');
    $('#note_vault_setup_modal').prop('hidden', false);
    $('#note_vault_new_password').trigger('focus');
};

const closeNoteVaultSetup = (restoreFocus = true) => {
    const triggerNoteId = pendingHiddenNoteId;
    $('#note_vault_setup_modal').prop('hidden', true);
    $('#note_vault_new_password, #note_vault_confirm_password').val('');
    $('#note_vault_setup_message').text('');
    pendingHiddenNoteId = null;
    if (restoreFocus && triggerNoteId) {
        noteListContainer.children('.user_note').filter(function () {
            return this.dataset.noteid === String(triggerNoteId);
        }).find('.hide_note_btn').trigger('focus');
    }
};

const openNoteVaultUnlock = () => {
    const isHiding = Boolean(pendingVaultHideNoteId);
    $('#note_vault_unlock_title').text(isHiding ? 'Confirm master password' : 'Show hidden note');
    $('#note_vault_unlock_description').text(isHiding
        ? 'Enter your master password to hide this note. You can reveal one note at a time for 1 minute; switching tabs or closing the popup locks them.'
        : 'Enter your master password to reveal this note. Other notes stay masked. You can reveal one note at a time for 1 minute; switching tabs or closing the popup locks them.');
    $('#unlock_note_vault_btn').text(isHiding ? 'Hide note' : 'Show note');
    $('#note_vault_message').text('');
    $('#note_vault_password').val('');
    $('#note_vault_unlock_modal').prop('hidden', false);
    $('#note_vault_password').trigger('focus');
};

const closeNoteVaultUnlock = (restoreFocus = true) => {
    const targetId = pendingVaultHideNoteId || pendingRevealNoteId;
    const targetSelector = pendingVaultHideNoteId ? '.hide_note_btn' : '.reveal_note_btn';
    $('#note_vault_unlock_modal').prop('hidden', true);
    $('#note_vault_password').val('');
    $('#note_vault_message').text('');
    pendingVaultHideNoteId = null;
    pendingRevealNoteId = null;
    if (restoreFocus && targetId) {
        noteListContainer.children('.user_note').filter(function () {
            return this.dataset.noteid === String(targetId);
        }).find(targetSelector).trigger('focus');
    }
};

const requestHideNote = (noteId) => {
    if (editingNoteId || noteDraftHasContent(getSafeNoteContent(), getNoteTitle())) {
        $('#note_editor_status').text('Save or discard the current draft before hiding a note.');
        openNoteComposerModal(editingNoteId ? getNoteEditor() : noteTitleInputElm[0]);
        return;
    }

    const noteToHide = global_app_data.e_notes.find((note) => String(note.id) === String(noteId) && note.isEncrypted !== true);
    if (!noteToHide) return;
    if (!getExplicitNoteTitle(noteToHide)) {
        startEditingNote(noteId);
        $('#note_editor_status').text('Add a title before hiding this note so its content stays private.');
        noteTitleInputElm.trigger('focus');
        return;
    }

    if (!global_app_data.e_notes_vault) {
        openNoteVaultSetup(noteId);
        return;
    }
    if (!hasActiveNoteVaultSession()) {
        pendingVaultHideNoteId = noteId;
        openNoteVaultUnlock();
        return;
    }
    hideNoteWithUnlockedVault(noteId).catch(() => {
        setNoteListStatus('The note could not be encrypted and hidden.');
    });
};

const requestRevealNote = async (noteId) => {
    if (hasActiveNoteVaultSession()) {
        try {
            await revealHiddenNote(noteId);
        } catch (error) {
            setNoteListStatus('The hidden note could not be opened.');
        }
        return;
    }

    pendingRevealNoteId = noteId;
    openNoteVaultUnlock();
};

const unlockNoteVault = async () => {
    if (noteVaultUnlocking) return;
    const passwordInput = $('#note_vault_password');
    const unlockButton = $('#unlock_note_vault_btn');
    const password = passwordInput.val();
    const metadata = global_app_data.e_notes_vault;
    if (!metadata || metadata.version !== 1 || metadata.kdf !== 'PBKDF2-SHA-256' || !metadata.check || !metadata.salt) {
        $('#note_vault_message').text('The hidden notes vault settings are invalid.');
        return;
    }
    if (!password) {
        $('#note_vault_message').text('Enter your master password.');
        passwordInput.trigger('focus');
        return;
    }

    noteVaultUnlocking = true;
    unlockButton.prop('disabled', true);
    $('#note_vault_message').text('Checking password…');
    try {
        const key = await deriveNoteVaultKey(password, base64ToBytes(metadata.salt), metadata.iterations);
        let checkValue;
        try {
            checkValue = await decryptNoteVaultValue(key, metadata.check);
        } catch (error) {
            throw new Error('incorrect-password');
        }
        if (checkValue !== NOTE_VAULT_CHECK) throw new Error('incorrect-password');

        noteVaultKey = key;
        refreshNoteVaultSession();
        let completed = false;
        if (pendingVaultHideNoteId) {
            completed = await hideNoteWithUnlockedVault(pendingVaultHideNoteId);
        } else if (pendingRevealNoteId) {
            completed = await revealHiddenNote(pendingRevealNoteId);
        }
        if (!completed) throw new Error('note-unavailable');
        closeNoteVaultUnlock(false);
    } catch (error) {
        passwordInput.val('');
        $('#note_vault_message').text(error.message === 'incorrect-password'
            ? 'That master password did not unlock the vault.'
            : 'The note could not be opened. Check the vault data and try again.');
        passwordInput.trigger('focus');
    } finally {
        noteVaultUnlocking = false;
        unlockButton.prop('disabled', false);
    }
};

const updateNoteToolbarState = () => {
    const editor = getNoteEditor();
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode || !editor.contains(selection.anchorNode)) return;

    $('.note_format_btn[data-command="bold"], .note_format_btn[data-command="italic"], .note_format_btn[data-command="underline"], .note_format_btn[data-command="insertUnorderedList"], .note_format_btn[data-command="insertOrderedList"]').each(function () {
        const command = this.dataset.command;
        const isActive = document.queryCommandState(command);
        $(this).toggleClass('active', isActive).attr('aria-pressed', String(isActive));
    });
};

$(function () {
    ensureNoteCollection();
    renderNoteList();
    loadNoteData();

    noteInputElm.on('input', () => {
        saveNoteDraft();
        updateNoteFormMode(Boolean(editingNoteId), noteDraftHasContent(getSafeNoteContent(), getNoteTitle()));
    });
    noteTitleInputElm.on('input', () => {
        saveNoteDraft();
        updateNoteFormMode(Boolean(editingNoteId), noteDraftHasContent(getSafeNoteContent(), getNoteTitle()));
    });
    noteInputElm.add(noteTitleInputElm).on('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            editingNoteId ? updateNote() : createNewNote();
        }
    });

    noteInputElm.on('paste drop', (event) => {
        event.preventDefault();
        const nativeEvent = event.originalEvent || event;
        const transfer = nativeEvent.clipboardData || nativeEvent.dataTransfer;
        const plainText = transfer ? transfer.getData('text/plain') : '';
        if (plainText) {
            insertPlainTextAtSelection(plainText);
            saveNoteDraft();
        }
    });

    $('.note_editor_toolbar').on('mousedown', '.note_format_btn', (event) => event.preventDefault());
    $('.note_editor_toolbar').on('click', '.note_format_btn', function () {
        getNoteEditor().focus();
        document.execCommand(this.dataset.command, false, this.dataset.value || null);
        saveNoteDraft();
        updateNoteToolbarState();
    });

    addNoteBtn.on('click', (event) => {
        event.preventDefault();
        editingNoteId ? updateNote() : createNewNote();
    });
    openNoteComposerButton.on('click', () => {
        setNoteListStatus('');
        openNoteComposerModal(editingNoteId ? getNoteEditor() : noteTitleInputElm[0]);
    });
    $('#close_note_composer_btn').on('click', () => closeNoteComposerModal());
    $('#cancel_note_edit_btn').on('click', resetNoteComposer);

    noteListContainer.on('click', '.edit_note_btn', function () {
        startEditingNote(String($(this).data('noteid')));
    });
    noteListContainer.on('click', '.hide_note_btn', function () {
        requestHideNote(String($(this).data('noteid')));
    });
    noteListContainer.on('click', '.reveal_note_btn', function () {
        requestRevealNote(String($(this).data('noteid')));
    });
    noteListContainer.on('click', '.mask_note_btn', function () {
        maskHiddenNote(String($(this).data('noteid')));
    });
    noteListContainer.on('click', '.unhide_note_btn', function () {
        unhideNote(String($(this).data('noteid')));
    });
    noteListContainer.on('click', '.delete_btn', function () {
        deleteNote(String($(this).data('noteid')));
    });
    noteListContainer.on('click', '.delete_hidden_note_btn', function () {
        deleteHiddenNote(String($(this).data('noteid')));
    });

    $('#note_vault_setup_form').on('submit', async (event) => {
        event.preventDefault();
        const password = $('#note_vault_new_password').val();
        const confirmation = $('#note_vault_confirm_password').val();
        const submitButton = $('#create_note_vault_btn');
        if (String(password).length < 12) {
            $('#note_vault_setup_message').text('Use a master password with at least 12 characters.');
            return;
        }
        if (password !== confirmation) {
            $('#note_vault_setup_message').text('The passwords do not match.');
            return;
        }

        submitButton.prop('disabled', true);
        $('#note_vault_setup_message').text('Encrypting the note…');
        try {
            await setupNoteVaultAndHideNote(pendingHiddenNoteId, password);
        } catch (error) {
            $('#note_vault_setup_message').text('The vault could not be created. Your note is unchanged.');
        } finally {
            submitButton.prop('disabled', false);
        }
    });

    $('#note_vault_unlock_form').on('submit', (event) => {
        event.preventDefault();
        unlockNoteVault();
    });
    $('#cancel_note_vault_setup_btn').on('click', closeNoteVaultSetup);
    $('#cancel_note_vault_unlock_btn').on('click', lockNoteVaultSession);

    document.addEventListener('keydown', (event) => {
        const setupModalOpen = !$('#note_vault_setup_modal').prop('hidden');
        const unlockModalOpen = !$('#note_vault_unlock_modal').prop('hidden');
        const composerModalOpen = noteComposerModal.hasClass('modal_active');
        if (event.key === 'Escape') {
            if (setupModalOpen) closeNoteVaultSetup();
            else if (unlockModalOpen) lockNoteVaultSession();
            else if (composerModalOpen) closeNoteComposerModal();
            return;
        }
        if (event.key !== 'Tab' || (!setupModalOpen && !unlockModalOpen && !composerModalOpen)) return;

        const dialog = setupModalOpen
            ? $('#note_vault_setup_form')[0]
            : unlockModalOpen
                ? $('#note_vault_unlock_form')[0]
                : noteComposerModal.find('[role="dialog"]')[0];
        const focusableElements = Array.from(dialog.querySelectorAll('input:not([disabled]):not([hidden]), button:not([disabled]):not([hidden]), [contenteditable="true"]'));
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });

    document.addEventListener('click', (event) => {
        const tabButton = event.target.closest('.tab_nav_button');
        if (tabButton && String(tabButton.dataset.tab) !== String(global_app_data.e_tab)) {
            lockNoteVaultSession();
        }
    }, true);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) lockNoteVaultSession();
    });
    window.addEventListener('pagehide', () => {
        hiddenNoteRevealSequence += 1;
        if (noteVaultTimer) clearTimeout(noteVaultTimer);
        noteVaultTimer = null;
        noteVaultKey = null;
        noteVaultExpiresAt = 0;
        unlockedHiddenNotes.clear();
        revealedHiddenNoteIds.clear();
    });
    document.addEventListener('selectionchange', updateNoteToolbarState);
});
