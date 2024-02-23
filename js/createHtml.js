// Create Todo List HTML
const createTodoList = (listInfo) => {
    return `
    <div class="todo_list_item ${listInfo.active ? "active_todo_list" : ""}" data-listid=${listInfo.id}>
    <div class="todo_list_btn" data-listid=${listInfo.id}></div>
        <div class="todo_list_info">
            <p class="todo_list_item_name">${listInfo.name}</p>
            <p class="todo_list_item_completion" data-listid=${listInfo.id}>${getCompletionPercentage(listInfo)} Complete</p>
        </div>
        <button type="button" class="setting_btn">
        <div data-listid=${listInfo.id} class="download_todo_list_btn btn_overlay"></div>
        <svg id="download_icon" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32.74">
        <g id="Layer_1-2" data-name="Layer 1">
          <g>
            <path class="cls-1" d="M30,21.33c-1.1,0-2,.9-2,2v5.41H4v-5.41c0-1.1-.9-2-2-2s-2,.9-2,2v7.41c0,1.1.9,2,2,2h28c1.1,0,2-.9,2-2v-7.41c0-1.1-.9-2-2-2Z"/>
            <path class="cls-1" d="M14.53,24.69s.04.03.06.05c.02.02.04.04.06.06.04.03.08.06.12.09.04.04.09.07.13.1.07.05.14.08.21.12.04.02.09.05.13.06.09.04.17.06.26.08.04,0,.07.02.11.03.13.03.26.04.39.04,0,0,0,0,0,0s0,0,0,0c.13,0,.26-.01.38-.04.05,0,.09-.03.13-.04.07-.02.14-.03.21-.06,0,0,.01,0,.02-.01.16-.07.32-.16.46-.27.04-.03.07-.06.1-.09.05-.05.11-.09.16-.14l7.78-8.44c.75-.81.7-2.08-.12-2.83-.81-.75-2.08-.7-2.83.12l-4.31,4.68V2c0-1.1-.9-2-2-2s-2,.9-2,2v16.21l-4.31-4.68c-.75-.81-2.01-.86-2.83-.12-.81.75-.86,2.01-.12,2.83l7.78,8.44Z"/>
          </g>
        </g>
      </svg>
        </button>
        <button data-listid=${listInfo.id} type="button" class="setting_btn delete_btn todo_list_delete_btn">
            <svg data-listid=${listInfo.id} xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" width="10.213" height="12"
                viewBox="0 0 10.213 12">
                <defs>
                    <clipPath id="a">
                        <rect width="10.213" height="12" />
                    </clipPath>
                </defs>
                <g clip-path="url(#a)">
                    <path
                        d="M.511,10.851A1.293,1.293,0,0,0,1.889,12H8.323A1.293,1.293,0,0,0,9.7,10.851V4.34H.511ZM2.247,5.617H2.86a.461.461,0,0,1,.46.46v4.187a.461.461,0,0,1-.46.46H2.247a.461.461,0,0,1-.46-.46V6.077a.461.461,0,0,1,.46-.46m2.553,0h.613a.461.461,0,0,1,.46.46v4.187a.461.461,0,0,1-.46.46H4.8a.461.461,0,0,1-.46-.46V6.077a.461.461,0,0,1,.46-.46m2.553,0h.613a.461.461,0,0,1,.46.46v4.187a.461.461,0,0,1-.46.46H7.353a.461.461,0,0,1-.46-.46V6.077a.461.461,0,0,1,.46-.46M1.021,2.043A1.021,1.021,0,0,0,0,3.064V3.83H10.213V3.064A1.021,1.021,0,0,0,9.191,2.043H7.66V.919A.918.918,0,0,0,6.74,0H3.472a.918.918,0,0,0-.919.919V2.043Zm5.617,0H3.574V1.481a.461.461,0,0,1,.46-.46H6.179a.461.461,0,0,1,.46.46Z"
                        fill-rule="evenodd" />
                </g>
            </svg>
        </button>
        
    </div>
    
    `
}
// create Todo HTML
const createTodo = (todoInfo) => {
    const todoWithLinks = findAndReplaceLinks(todoInfo.todo);

    const checkDueDateIsPastDue = (dueDate) => {
        // if the todo has a dueDate, check to see if it is past due
        if (dueDate) {
            // Parse the input due date string into a Date object
            const dueDateObject = new Date(dueDate);

            // Get the current date
            const currentDate = new Date();

            // Compare the due date with the current date
            return dueDateObject < currentDate;
        }

        // If there's no due date, it's not past due
        return false;
    }
    return `
            <div class="todo_item ${todoInfo.checked ? "todo_checked" : ""}" data-todoid=${todoInfo.id}>
                <!-- if there is a due date -->
                ${todoInfo.dueDate ? `<p class="todo_due_date ${!todoInfo.checked && checkDueDateIsPastDue(todoInfo.dueDate) ? "overdue" : ""} ${todoInfo.checked ? "complete" : ""}">Due: ${formatDate(todoInfo.dueDate)}</p>` : ''}

                <div class="todo_item_cont">
                    <div class="todo_item_col todo_item_left">
                        <input type="checkbox" data-todoid=${todoInfo.id} name="doublequotes" class="checkbox_input complete_todo" ${todoInfo.checked ? "checked" : ''}>
                        <div class="todo_text_cont">
                            <p class="todo_item_text" data-todoid=${todoInfo.id}>${todoWithLinks}</p>
                            <div class="change_todo_form" type="submit">
                                <textarea type="text" name="todo" spellcheck="true" data-todoid=${todoInfo.id} class="todo_change_text_input">${todoInfo.todo}</textarea>
                                <button type="button" class="cancel_change_todo_btn" data-todoid=${todoInfo.id}>
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        xmlns:xlink="http://www.w3.org/1999/xlink" width="12"
                                        height="12" viewBox="0 0 12 12">
                                        <defs>
                                            <clipPath id="a">
                                                <rect width="12" height="12" />
                                            </clipPath>
                                        </defs>
                                        <g clip-path="url(#a)">
                                            <path
                                                d="M11.693,9.572,8.121,6l3.572-3.572a1.051,1.051,0,0,0,0-1.485L11.057.307a1.052,1.052,0,0,0-1.485,0L6,3.879,2.429.307a1.052,1.052,0,0,0-1.485,0L.307.943a1.051,1.051,0,0,0,0,1.485L3.879,6,.307,9.572a1.051,1.051,0,0,0,0,1.485l.636.636a1.051,1.051,0,0,0,1.485,0L6,8.121l3.572,3.571a1.051,1.051,0,0,0,1.485,0l.636-.636a1.051,1.051,0,0,0,0-1.485"
                                                transform="translate(0 0)" fill-rule="evenodd" />
                                        </g>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="todo_item_col todo_item_right">
                        <button data-todoid=${todoInfo.id} type="button"
                            class=" main_icon_button todo_set_due_date_btn">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                xmlns:xlink="http://www.w3.org/1999/xlink" width="11.182"
                                height="12" viewBox="0 0 11.182 12">
                                <defs>
                                    <clipPath id="a">
                                        <rect width="11.182" height="12" />
                                    </clipPath>
                                </defs>
                                <g clip-path="url(#a)">
                                    <path
                                        d="M1.909.265v.818h.818V.265A.266.266,0,0,0,2.463,0H2.174a.266.266,0,0,0-.265.265m4.364,0v.818h.818V.265A.266.266,0,0,0,6.826,0H6.537a.266.266,0,0,0-.265.265m2.182,0v.818h.818V.265A.266.266,0,0,0,9.008,0H8.719a.266.266,0,0,0-.265.265m-4.364.818.818.008V.265A.266.266,0,0,0,4.645,0H4.355a.266.266,0,0,0-.265.265Zm2.182.008H4.909V2.182a.244.244,0,0,1-.265.273H4.355a.244.244,0,0,1-.265-.273V1.091H2.727V2.182a.244.244,0,0,1-.265.273H2.174a.244.244,0,0,1-.265-.273V1.091H1.677A1.673,1.673,0,0,0,0,2.727v7.636A1.673,1.673,0,0,0,1.677,12H9.5a1.673,1.673,0,0,0,1.677-1.636V2.727A1.673,1.673,0,0,0,9.5,1.091H9.273V2.182a.244.244,0,0,1-.265.273H8.719a.244.244,0,0,1-.265-.273V1.091H7.091v1.1a.238.238,0,0,1-.265.265H6.537a.244.244,0,0,1-.265-.273ZM2.182,8.455H9a.26.26,0,0,1,.273.256v.562A.274.274,0,0,1,9,9.545H2.182a.274.274,0,0,1-.273-.273V8.711a.26.26,0,0,1,.273-.256m0-1.909H9a.252.252,0,0,1,.273.248v.57A.274.274,0,0,1,9,7.636H2.182a.274.274,0,0,1-.273-.273V6.81a.267.267,0,0,1,.273-.265m0-1.909H9a.252.252,0,0,1,.273.248v.57A.274.274,0,0,1,9,5.727H2.182a.274.274,0,0,1-.273-.273V4.892a.26.26,0,0,1,.273-.256"
                                        transform="translate(0)" fill-rule="evenodd" />
                                </g>
                            </svg>
                        </button>
                        <button data-todoid=${todoInfo.id} type="button"
                            class=" main_icon_button todo_delete_btn danger_btn">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                xmlns:xlink="http://www.w3.org/1999/xlink" width="10.213"
                                height="12" viewBox="0 0 10.213 12">
                                <defs>
                                    <clipPath id="a">
                                        <rect width="10.213" height="12" />
                                    </clipPath>
                                </defs>
                                <g clip-path="url(#a)">
                                    <path
                                        d="M.511,10.851A1.293,1.293,0,0,0,1.889,12H8.323A1.293,1.293,0,0,0,9.7,10.851V4.34H.511ZM2.247,5.617H2.86a.461.461,0,0,1,.46.46v4.187a.461.461,0,0,1-.46.46H2.247a.461.461,0,0,1-.46-.46V6.077a.461.461,0,0,1,.46-.46m2.553,0h.613a.461.461,0,0,1,.46.46v4.187a.461.461,0,0,1-.46.46H4.8a.461.461,0,0,1-.46-.46V6.077a.461.461,0,0,1,.46-.46m2.553,0h.613a.461.461,0,0,1,.46.46v4.187a.461.461,0,0,1-.46.46H7.353a.461.461,0,0,1-.46-.46V6.077a.461.461,0,0,1,.46-.46M1.021,2.043A1.021,1.021,0,0,0,0,3.064V3.83H10.213V3.064A1.021,1.021,0,0,0,9.191,2.043H7.66V.919A.918.918,0,0,0,6.74,0H3.472a.918.918,0,0,0-.919.919V2.043Zm5.617,0H3.574V1.481a.461.461,0,0,1,.46-.46H6.179a.461.461,0,0,1,.46.46Z"
                                        fill-rule="evenodd" />
                                </g>
                            </svg>
                        </button>
                    </div>

                </div>
            </div>
    
    `
}
// create note HTML
const createNote = (noteData) => {
    const noteWithLinks = findAndReplaceLinks(noteData.note);

    return `
    <div class="user_note">
        <button data-noteid=${noteData.id} type="button" class="setting_btn close_btn delete_btn">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="10.213" height="12" viewBox="0 0 10.213 12"><defs><clipPath id="a"><rect width="10.213" height="12"/></clipPath></defs><g clip-path="url(#a)"><path d="M.511,10.851A1.293,1.293,0,0,0,1.889,12H8.323A1.293,1.293,0,0,0,9.7,10.851V4.34H.511ZM2.247,5.617H2.86a.461.461,0,0,1,.46.46v4.187a.461.461,0,0,1-.46.46H2.247a.461.461,0,0,1-.46-.46V6.077a.461.461,0,0,1,.46-.46m2.553,0h.613a.461.461,0,0,1,.46.46v4.187a.461.461,0,0,1-.46.46H4.8a.461.461,0,0,1-.46-.46V6.077a.461.461,0,0,1,.46-.46m2.553,0h.613a.461.461,0,0,1,.46.46v4.187a.461.461,0,0,1-.46.46H7.353a.461.461,0,0,1-.46-.46V6.077a.461.461,0,0,1,.46-.46M1.021,2.043A1.021,1.021,0,0,0,0,3.064V3.83H10.213V3.064A1.021,1.021,0,0,0,9.191,2.043H7.66V.919A.918.918,0,0,0,6.74,0H3.472a.918.918,0,0,0-.919.919V2.043Zm5.617,0H3.574V1.481a.461.461,0,0,1,.46-.46H6.179a.461.461,0,0,1,.46.46Z" fill-rule="evenodd"/></g></svg>
        </button>
       <p class="note_text">${noteWithLinks}</p>
       <p class="note_date">Noted: ${noteData.dateCreated}</p>
    </div>
    `;
}


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
                        ${colorData.colorName != undefined ? `<p class="e_color_pallet_item_name ${isLight ? "dark" : "light"}">${colorData.colorName}</p>`:""}
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

                        <div class="color_pallet_item_add_btn" data-index="${index}" data-addcolorindex="${index + 1 }"></div>
                    </div>
                </div> `}
                    
                </div>
    
    `
}