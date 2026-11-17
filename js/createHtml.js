// Todo cards share the same safe rich-text renderer as notes.
const todoActionIcon = (path) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>`;

const createTodoList = (list) => `
    <div class="todo_list_item ${list.active ? 'active_todo_list' : ''}" data-listid="${escapeHtml(list.id)}">
        <button type="button" class="todo_list_btn" data-listid="${escapeHtml(list.id)}" aria-label="Open ${escapeHtml(list.name)}" ${list.active ? 'aria-current="true"' : ''}></button>
        <div class="todo_list_info">
            <p class="todo_list_item_name">${escapeHtml(list.name)}</p>
            <p class="todo_list_item_completion">${getCompletionPercentage(list)}</p>
        </div>
        <button type="button" class="setting_btn download_todo_list_btn" data-listid="${escapeHtml(list.id)}" aria-label="Export ${escapeHtml(list.name)}" title="Export list">
            ${todoActionIcon('M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5')}
        </button>
        <button type="button" class="setting_btn delete_btn todo_list_delete_btn" data-listid="${escapeHtml(list.id)}" aria-label="Delete ${escapeHtml(list.name)}" title="Delete list">
            ${todoActionIcon('M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7')}
        </button>
    </div>`;

const createTodo = (todo) => {
    const id = escapeHtml(todo.id);
    const dateStatus = TodoModel.dueDateStatus(todo.dueDate);
    const content = richTextToMarkup(todo.contentHtml ?? todo.todo, typeof todo.contentHtml === 'string' ? 'html' : 'text');
    return `
        <div class="todo_item ${todo.checked ? 'todo_checked' : ''}" data-todoid="${id}">
            ${TodoModel.parseDueDate(todo.dueDate) ? `<p class="todo_due_date ${todo.checked ? 'complete' : dateStatus}">Due: <time datetime="${escapeHtml(todo.dueDate)}">${TodoModel.formatDueDate(todo.dueDate)}</time></p>` : ''}
            <div class="todo_item_cont">
                <button type="button" class="todo_drag_handle" aria-label="Reorder todo" title="Drag to reorder, or use Alt + Up/Down">
                    ${todoActionIcon('M8 5h1m6 0h1M8 12h1m6 0h1M8 19h1m6 0h1')}
                </button>
                <div class="todo_item_col todo_item_left">
                    <input type="checkbox" data-todoid="${id}" class="checkbox_input complete_todo" aria-label="Mark todo ${todo.checked ? 'incomplete' : 'complete'}" ${todo.checked ? 'checked' : ''}>
                    <div class="todo_text_cont"><div class="todo_item_text" data-todoid="${id}">${content}</div></div>
                </div>
                <div class="todo_item_col todo_item_right">
                    <button type="button" class="setting_btn todo_edit_btn" data-todoid="${id}" aria-label="Edit todo" title="Edit todo">
                        ${todoActionIcon('m15 5 4 4M4 20l4-1L20 7l-4-4L4 15v5Z')}
                    </button>
                    <button type="button" class="setting_btn todo_set_due_date_btn" data-todoid="${id}" aria-label="Set due date" title="Set due date">
                        ${todoActionIcon('M4 5h16v16H4V5ZM4 10h16M8 3v4m8-4v4')}
                    </button>
                    <button type="button" class="setting_btn danger_btn todo_delete_btn" data-todoid="${id}" aria-label="Delete todo" title="Delete todo">
                        ${todoActionIcon('M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7')}
                    </button>
                </div>
            </div>
        </div>`;
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
const escapeNoteAttribute = escapeHtml;

const RICH_TEXT_ALLOWED_ELEMENTS = new Set(['A', 'B', 'BR', 'DIV', 'EM', 'H3', 'I', 'LI', 'OL', 'P', 'S', 'STRONG', 'U', 'UL']);
const RICH_TEXT_DANGEROUS_ELEMENTS = new Set(['IFRAME', 'OBJECT', 'SCRIPT', 'STYLE', 'SVG', 'TEMPLATE']);

const sanitizeRichTextMarkup = (markup) => {
    const template = document.createElement('template');
    template.innerHTML = String(markup || '');

    const cleanChildren = (parent) => {
        Array.from(parent.childNodes).forEach((node) => {
            if (node.nodeType === Node.COMMENT_NODE) {
                node.remove();
                return;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            if (!RICH_TEXT_ALLOWED_ELEMENTS.has(node.tagName)) {
                if (RICH_TEXT_DANGEROUS_ELEMENTS.has(node.tagName)) {
                    node.remove();
                } else {
                    cleanChildren(node);
                    node.replaceWith(...Array.from(node.childNodes));
                }
                return;
            }

            Array.from(node.attributes).forEach((attribute) => {
                if (node.tagName !== 'A' || attribute.name !== 'href') {
                    node.removeAttribute(attribute.name);
                }
            });

            if (node.tagName === 'A') {
                const rawHref = node.getAttribute('href');
                try {
                    const url = new URL(rawHref, window.location.href);
                    if (rawHref && ['http:', 'https:'].includes(url.protocol)) {
                        node.setAttribute('href', url.href);
                        node.className = 'note_text_link';
                        node.setAttribute('target', '_blank');
                        node.setAttribute('rel', 'noopener noreferrer');
                    } else {
                        cleanChildren(node);
                        node.replaceWith(...Array.from(node.childNodes));
                        return;
                    }
                } catch (error) {
                    cleanChildren(node);
                    node.replaceWith(...Array.from(node.childNodes));
                    return;
                }
            }

            cleanChildren(node);
        });
    };

    cleanChildren(template.content);
    return template.innerHTML;
};
const sanitizeNoteMarkup = sanitizeRichTextMarkup;

const appendRichText = (container, text) => {
    const value = String(text || '');
    const urlPattern = /https?:\/\/[^\s<>"']+/gi;
    let cursor = 0;
    let match;

    const appendPlainText = (plainText) => {
        plainText.split(/(\r?\n)/).forEach((part) => {
            if (part === '\n' || part === '\r\n') {
                container.appendChild(document.createElement('br'));
            } else if (part) {
                container.appendChild(document.createTextNode(part));
            }
        });
    };

    while ((match = urlPattern.exec(value)) !== null) {
        let candidate = match[0];
        let trailing = '';
        while (/[),.!?;:]$/.test(candidate)) {
            trailing = candidate.slice(-1) + trailing;
            candidate = candidate.slice(0, -1);
        }
        appendPlainText(value.slice(cursor, match.index));

        try {
            const url = new URL(candidate);
            if (['http:', 'https:'].includes(url.protocol)) {
                const link = document.createElement('a');
                link.className = 'note_text_link';
                link.href = url.href;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = url.hostname;
                container.appendChild(link);
            } else {
                appendPlainText(candidate);
            }
        } catch (error) {
            appendPlainText(candidate);
        }

        appendPlainText(trailing);
        cursor = match.index + match[0].length;
    }

    appendPlainText(value.slice(cursor));
};

const linkifyRichTextFragment = (fragment) => {
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
        const parent = walker.currentNode.parentElement;
        if (!parent || !parent.closest('a')) textNodes.push(walker.currentNode);
    }

    textNodes.forEach((textNode) => {
        const wrapper = document.createElement('span');
        appendRichText(wrapper, textNode.nodeValue);
        textNode.replaceWith(...Array.from(wrapper.childNodes));
    });
};

const richTextToMarkup = (content, format = 'text') => {
    if (format === 'html') {
        const template = document.createElement('template');
        template.innerHTML = sanitizeRichTextMarkup(content);
        linkifyRichTextFragment(template.content);
        return template.innerHTML;
    }

    const plainContent = document.createElement('div');
    appendRichText(plainContent, content);
    return plainContent.innerHTML;
};

const richTextForEditor = (content, format = 'text') => {
    if (format === 'html') return sanitizeRichTextMarkup(content);

    const container = document.createElement('div');
    String(content || '').split(/(\r?\n)/).forEach((part) => {
        if (part === '\n' || part === '\r\n') {
            container.appendChild(document.createElement('br'));
        } else if (part) {
            container.appendChild(document.createTextNode(part));
        }
    });
    return container.innerHTML;
};

const plainTextFromRichText = (markup) => {
    const template = document.createElement('template');
    template.innerHTML = sanitizeRichTextMarkup(markup);
    template.content.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
    template.content.querySelectorAll('p, div, h3, li').forEach((node) => node.append('\n'));
    return template.content.textContent.replace(/\u00a0/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
};

const noteContentToMarkup = (note) => richTextToMarkup(note.note, note.contentFormat);
const noteContentForEditor = (note) => richTextForEditor(note.note, note.contentFormat);

// create note HTML
const getNoteDisplayTitle = (noteData) => {
    const savedTitle = String(noteData.title || '').trim();
    if (savedTitle) return savedTitle;

    let contentText = String(noteData.note || '');
    if (noteData.contentFormat === 'html') {
        const template = document.createElement('template');
        template.innerHTML = sanitizeNoteMarkup(contentText);
        contentText = template.content.textContent;
    }
    return contentText.replace(/\s+/g, ' ').trim().slice(0, 64) || 'Untitled note';
};

const noteVisibilityIcon = (show) => `
    <svg class="note_visibility_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
        ${show ? '' : '<path d="m3 3 18 18" />'}
    </svg>`;

const noteDeleteIcon = `
    <svg class="note_delete_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
    </svg>`;

const createNote = (noteData) => {
    const noteId = escapeNoteAttribute(noteData.id);
    const isMasked = noteData.isEncrypted === true && noteData.isRevealed !== true;
    const isHiddenNote = noteData.isHidden === true || noteData.isEncrypted === true;
    const title = escapeNoteAttribute(getNoteDisplayTitle(noteData));
    const noteMarkup = isMasked
        ? '<span class="note_masked_text" aria-label="Hidden note content">***</span>'
        : noteContentToMarkup(noteData);
    const noteDate = noteData.dateCreated
        ? escapeNoteAttribute(formatDateAndTime(noteData.dateCreated))
        : '';
    const editedDate = noteData.dateUpdated
        ? escapeNoteAttribute(formatDateAndTime(noteData.dateUpdated))
        : '';
    const deleteLabel = isMasked || noteData.isHidden ? 'Delete hidden note' : 'Delete note';
    const deleteButton = `<button data-noteid="${noteId}" type="button" class="note_action_btn note_delete_btn ${isMasked || noteData.isHidden ? 'delete_hidden_note_btn' : 'delete_btn'}" aria-label="${deleteLabel}" title="${deleteLabel}">${noteDeleteIcon}</button>`;
    let noteActions;

    if (isMasked) {
        noteActions = `<button data-noteid="${noteId}" type="button" class="note_action_btn note_visibility_btn reveal_note_btn" aria-label="Show hidden note" title="Show hidden note">${noteVisibilityIcon(true)}</button>
            ${deleteButton}`;
    } else if (noteData.isHidden) {
        noteActions = `<button data-noteid="${noteId}" type="button" class="note_action_btn unhide_note_btn" aria-label="Unhide note">Unhide</button>
            <button data-noteid="${noteId}" type="button" class="note_action_btn note_visibility_btn mask_note_btn" aria-label="Hide note again" title="Hide note again">${noteVisibilityIcon(false)}</button>
            ${deleteButton}`;
    } else {
        noteActions = `<button data-noteid="${noteId}" type="button" class="note_action_btn edit_note_btn" aria-label="Edit note">Edit</button>
            <button data-noteid="${noteId}" type="button" class="note_action_btn note_visibility_btn hide_note_btn" aria-label="Hide note" title="Hide note">${noteVisibilityIcon(false)}</button>
            ${deleteButton}`;
    }

    return `
        <article class="user_note ${isHiddenNote ? 'hidden_note' : ''}" data-noteid="${noteId}">
            <div class="note_actions">${noteActions}</div>
            <h2 class="note_title">${title}</h2>
            <div class="note_text">${noteMarkup}</div>
            ${noteDate || editedDate
                ? `<p class="note_date">Noted: ${noteDate}${editedDate ? `<span class="note_edited_at"> · Edited at: ${editedDate}</span>` : ''}</p>`
                : `<p class="note_date">${isMasked ? 'Hidden note' : 'Noted'}</p>`}
        </article>
    `;
};

const createColorPalletItem = (colorData, index, colorArrLength, limit) => {

    let isLight = isColorLight(colorData.color)
    let colorHex = returnColorName(colorData.color)

    return `
    
    <div class="e_color_pallet_item" style="background-color: ${colorData.color};" id="${colorData.id}">
                    <div class="e_color_pallet_item_overlay">
                    <div class="color_change_form">
                        <p data-colorid="${colorData.id}" class="e_color_pallet_item_text ${isLight ? "dark" : "light"}">${colorHex}</p>
                        <input data-colorid="${colorData.id}" hidden type="text" placeholder="#FFFFFF" value="${colorHex}" class="e_color_change_input"/>
                    </div>
                        ${colorData.colorName != undefined ? `<p class="e_color_pallet_item_name ${isLight ? "dark" : "light"}">${colorData.colorName}</p>` : ""}
                        <div class="e_color_pallet_item_settings_cont">
                            <!-- copy button -->
                            <div class="color_pallet_item_setting_btn_cont">
                                <svg class="${isLight ? "dark" : "light"}" xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink" width="15" height="15"
                                    viewBox="0 0 15 15">
                                    <defs>
                                        <clipPath id="clip-path">
                                            <rect id="Rectangle_10" data-name="Rectangle 10" width="15" height="15"
                                                transform="translate(0 -0.5)" />
                                        </clipPath>
                                    </defs>
                                    <g id="Group_128" data-name="Group 128" transform="translate(0 0.5)">
                                        <g id="Group_7" data-name="Group 7" transform="translate(0 0)"
                                            clip-path="url(#clip-path)">
                                            <path id="Path_4" data-name="Path 4"
                                                d="M1.693,0A1.691,1.691,0,0,0,0,1.69V7.977a1.691,1.691,0,0,0,1.693,1.69h1.64V5.507A2.174,2.174,0,0,1,5.51,3.333H9.667V1.69A1.691,1.691,0,0,0,7.973,0ZM6.027,4.333a1.691,1.691,0,0,0-1.693,1.69V12.31A1.691,1.691,0,0,0,6.027,14H12.31A1.69,1.69,0,0,0,14,12.31V6.023a1.69,1.69,0,0,0-1.69-1.69Z"
                                                transform="translate(0.5 0.5)" fill-rule="evenodd" />
                                        </g>
                                    </g>
                                </svg>

                                <div class="color_pallet_item_setting_btn" data-btntype="copy" data-colorid="${colorData.id}"></div>
                            </div>
                            <!-- lock button -->
                            <div class="color_pallet_item_setting_btn_cont">
                                <!-- locked icon -->
                                <svg class="lock_icon ${colorData.isLocked ? "active" : ""} ${isLight ? "dark" : "light"}" xmlns="http://www.w3.org/2000/svg" width="12.25"
                                    height="14" viewBox="0 0 12.25 14">
                                    <path id="Icon_awesome-lock" data-name="Icon awesome-lock"
                                        d="M10.938,6.125h-.656V4.156a4.156,4.156,0,1,0-8.312,0V6.125H1.313A1.313,1.313,0,0,0,0,7.438v5.25A1.313,1.313,0,0,0,1.313,14h9.625a1.313,1.313,0,0,0,1.312-1.312V7.438A1.313,1.313,0,0,0,10.938,6.125Zm-2.844,0H4.156V4.156a1.969,1.969,0,1,1,3.937,0Z" />
                                </svg>
                                <!-- unlocked icon -->
                                <svg class="unlocked_lock_icon ${colorData.isLocked ? "" : "active"} ${isLight ? "dark" : "light"}" xmlns="http://www.w3.org/2000/svg"
                                    width="14" height="12.444" viewBox="0 0 14 12.444">
                                    <path id="Icon_awesome-lock-open" data-name="Icon awesome-lock-open"
                                        d="M10.293,0A3.718,3.718,0,0,0,6.611,3.731V5.444H1.167A1.167,1.167,0,0,0,0,6.611v4.667a1.167,1.167,0,0,0,1.167,1.167H9.722a1.167,1.167,0,0,0,1.167-1.167V6.611A1.167,1.167,0,0,0,9.722,5.444H8.556V3.716a1.75,1.75,0,1,1,3.5-.022V5.639a.582.582,0,0,0,.583.583h.778A.582.582,0,0,0,14,5.639V3.694A3.7,3.7,0,0,0,10.293,0Z" />
                                </svg>

                                <div class="color_pallet_item_setting_btn" data-btntype="lock" data-colorid="${colorData.id}"></div>
                            </div>

                            <!-- Draggable button -->
                            <div class="color_pallet_item_setting_btn_cont">
                                <svg class="drag_color_icon ${isLight ? "dark" : "light"}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M406.6 374.6l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224l-293.5 0 41.4-41.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288l293.5 0-41.4 41.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z"/></svg>

                                <div class="color_pallet_item_setting_btn color_drag_handle" data-btntype="drag" data-colorid="${colorData.id}"></div>
                            </div>

                            <!-- remove color button -->
                            ${colorArrLength <= 2 ? "" : `<div class="color_pallet_item_setting_btn_cont">
                            <svg class="remove_color_icon ${isLight ? "dark" : "light"}" data-name="Group 129"
                                xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                width="11.915" height="14" viewBox="0 0 11.915 14">
                                <defs>
                                    <clipPath id="clip-path">
                                        <rect id="Rectangle_23" data-name="Rectangle 23" width="11.915"
                                            height="14" />
                                    </clipPath>
                                </defs>
                                <g id="Group_23" data-name="Group 23" clip-path="url(#clip-path)">
                                    <path id="Path_16" data-name="Path 16"
                                        d="M.6,12.66A1.508,1.508,0,0,0,2.2,14H9.711a1.508,1.508,0,0,0,1.609-1.34v-7.6H.6ZM2.621,6.553h.715a.538.538,0,0,1,.536.536v4.885a.538.538,0,0,1-.536.536H2.621a.538.538,0,0,1-.536-.536V7.089a.538.538,0,0,1,.536-.536m2.979,0h.715a.538.538,0,0,1,.536.536v4.885a.538.538,0,0,1-.536.536H5.6a.538.538,0,0,1-.536-.536V7.089A.538.538,0,0,1,5.6,6.553m2.979,0h.715a.538.538,0,0,1,.536.536v4.885a.538.538,0,0,1-.536.536H8.579a.538.538,0,0,1-.536-.536V7.089a.538.538,0,0,1,.536-.536M1.191,2.383A1.191,1.191,0,0,0,0,3.574v.894H11.915V3.574a1.191,1.191,0,0,0-1.191-1.191H8.936V1.072A1.071,1.071,0,0,0,7.864,0H4.051A1.071,1.071,0,0,0,2.979,1.072V2.383Zm6.553,0H4.17V1.728a.538.538,0,0,1,.536-.536h2.5a.538.538,0,0,1,.536.536Z"
                                        fill-rule="evenodd" />
                                </g>
                            </svg>
                            <div class="color_pallet_item_setting_btn" data-btntype="remove" data-colorid="${colorData.id}"></div>
                        </div>`}
                        </div>
                    </div>
                    <!-- add color item button left -->
                    ${(index === 0 || colorArrLength === limit) ? "" : `<div class="add_color_item_cont left">
                    <div class="color_pallet_item_add_btn_cont">
                            <svg class="add_color_icon" xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink" width="8" height="8" viewBox="0 0 8 8">
                                <defs>
                                <clipPath id="clip-path">
                                    <rect id="Rectangle_125" data-name="Rectangle 125" width="8" height="8" />
                                </clipPath>
                                </defs>
                                <g id="Group_155" data-name="Group 155" clip-path="url(#clip-path)">
                                <path id="Path_35" data-name="Path 35"
                                    d="M5,7.3V5H7.3A.7.7,0,0,0,8,4.3V3.7A.7.7,0,0,0,7.3,3H5V.7A.7.7,0,0,0,4.3,0H3.7A.7.7,0,0,0,3,.7V3H.7a.7.7,0,0,0-.7.7v.6A.7.7,0,0,0,.7,5H3V7.3a.7.7,0,0,0,.7.7h.6A.7.7,0,0,0,5,7.3"
                                    fill-rule="evenodd" />
                                </g>
                            </svg>

                            <div class="color_pallet_item_add_btn" data-index="${index}" data-addcolorindex="${index === 0 ? index + 1 : index}"></div>
                        </div>
                    </div>`}

                    <!-- add color item button right -->
                    ${(index + 1) === colorArrLength || colorArrLength === limit ? "" : `<div class="add_color_item_cont right">
                    <div class="color_pallet_item_add_btn_cont">
                        <svg class="add_color_icon" xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink" width="8" height="8" viewBox="0 0 8 8">
                            <defs>
                                <clipPath id="clip-path">
                                    <rect id="Rectangle_125" data-name="Rectangle 125" width="8" height="8" />
                                </clipPath>
                            </defs>
                            <g id="Group_155" data-name="Group 155" clip-path="url(#clip-path)">
                                <path id="Path_35" data-name="Path 35"
                                    d="M5,7.3V5H7.3A.7.7,0,0,0,8,4.3V3.7A.7.7,0,0,0,7.3,3H5V.7A.7.7,0,0,0,4.3,0H3.7A.7.7,0,0,0,3,.7V3H.7a.7.7,0,0,0-.7.7v.6A.7.7,0,0,0,.7,5H3V7.3a.7.7,0,0,0,.7.7h.6A.7.7,0,0,0,5,7.3"
                                    fill-rule="evenodd" />
                            </g>
                        </svg>

                        <div class="color_pallet_item_add_btn" data-index="${index}" data-addcolorindex="${index + 1}"></div>
                    </div>
                </div> `}
                    
                </div>
    
    `
}
