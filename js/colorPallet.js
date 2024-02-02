class ColorPallet {
    constructor() {
        this.id = this.makeId();
        this.colors = [];
        this.active = true;
    }

    makeId() {
        return createId()
    }

    addColor(color) {
        this.colors.push(color);
    }

    addColorAtIndex(colorIndex, newColor) {
        this.colors.splice(colorIndex, 0, newColor)
    }

    removeColor(colorId) {
        this.colors = this.colors.filter(c => c.id !== colorId);
    }

    replaceColor(colorIndex, newColor) {
        this.colors.splice(colorIndex, 1, newColor)
    }

    toggleActive() {
        this.active = !this.active;
    }

    replacePallet(pallet) {
        this.colors = pallet
    }
}

// return current color pallet
const returnCurrentPallet = () => {
    return global_app_data.e_color_pallet.find(l => l.active === true)
}

const setActivePalletsToFalse = () => {
    console.log("Setting all active lists to false: ", global_app_data.e_color_pallet)
    global_app_data.e_color_pallet.forEach(c => {
        c.active = false
    })
}

// return random hex code index
function returnRandomCodeIndex() {
    var ranIndex = Math.floor(Math.random() * 15) + 1;
    return c[ranIndex];
}


// creates one hex color
function generateRandomColor() {
    let colorBuild = "";
    for (let i = 0; i <= 5; i++) {
        colorBuild += returnRandomCodeIndex(colorBuild);
    }
    //at the end of building the color then push into color array
    return colorBuild
}

// when user first loads app, generate 5 colors
const generateFirstFiveColors = () => {
    let newPallet = new ColorPallet()
    for (let index = 0; index < 5; index++) {
        let newColor = {
            id: createId(),
            color: `#${generateRandomColor()}`,
            isLocked: false,
        }
        newPallet.addColor(newColor)

    }
    global_app_data.e_color_pallet.push(newPallet)
    // save to local
    saveToLocalStorage()
}


// add / generate a new color at specified index
const generateSingleColorAtIndex = (addIndex) => {
    // need to create a new pallet
    let newPallet = new ColorPallet
    let currentPallet = returnCurrentPallet()
    console.log("about to create new color at index: " + addIndex)
    newPallet.replacePallet(currentPallet.colors)
    // create color
    let newColor = {
        id: createId(),
        color: `#${generateRandomColor()}`,
        isLocked: false,
    }
    // add new color at index
    if (addIndex === 0) {
        let newIndex = addIndex + 1
        // global_app_data.e_color_pallet.splice(addIndex + 1, 0, newColor);
        newPallet.addColorAtIndex(newIndex, newColor)
    } else {
        // global_app_data.e_color_pallet.splice(addIndex + 1, 0, newColor);
        newPallet.addColorAtIndex(addIndex, newColor)
    }
    // set active to false
    setActivePalletsToFalse()
    // add pallet to global
    global_app_data.e_color_pallet.push(newPallet)
    // save to local
    saveToLocalStorage()
    // render new color
    renderColorPallet()
}

// generate new colors for unlocked items
const generateUnlockedColors = () => {
    // need to create a new pallet
    let newPallet = new ColorPallet
    let currentPallet = returnCurrentPallet()
    newPallet.replacePallet(currentPallet.colors)
    console.log("New Pallet in generateUnlockedColors: ", newPallet)
    // foreach color, check if locked, if locked skip
    newPallet.colors.forEach((c, index) => {
        if (!c.isLocked) {
            // create color
            let newColor = {
                id: createId(),
                color: `#${generateRandomColor()}`,
                isLocked: false,
            }
            // replace this color
            newPallet.replaceColor(index, newColor)
        }
    })

    // set active to false
    setActivePalletsToFalse()
    // add pallet to global
    global_app_data.e_color_pallet.push(newPallet)
    // save
    saveToLocalStorage()
    // render pallet
    renderColorPallet()
}

// render and load UI
const renderColorPallet = () => {
    // get current pallet
    let currentPallet = returnCurrentPallet()
    console.log("about to render pallet: ", currentPallet)
    $(".e_color_pallet_cont").empty()
    currentPallet.colors.map((colorPallet, index) => {
        $(".e_color_pallet_cont").append(createColorPalletItem(colorPallet, index, currentPallet.colors.length, global_app_data.e_color_pallet_limit))
    })
}

// close menu
const closeDownloadMenu = () => {
    if (downloadPalletMenuOpen) {
        $(".e_pallet_download_drop_down_cont").removeClass("active")
        downloadPalletMenuOpen = false
    }
}

// beginning of color pallet
const loadColorPallet = () => {
    // only render a new set of colors if there is none that have been generated previously.
    if (global_app_data.e_color_pallet.length === 0) {
        // loadColorPallet
        generateFirstFiveColors()
    }
    // render on load
    renderColorPallet()
    // load output for css
    e_color_pallet_css_output.val(generateCSSOutput())
    e_color_pallet_hex_output.val(generateHEXOutput())
}

const handleLockColor = (lockId) => {
    let currentPallet = returnCurrentPallet()
    let newPallet = new ColorPallet
    newPallet.replacePallet(currentPallet.colors)
    newPallet.colors.forEach(color => {
        color.id === lockId ? color.isLocked = !color.isLocked : ""
    });

    // set active to false
    setActivePalletsToFalse()
    // add pallet to global
    global_app_data.e_color_pallet.push(newPallet)
    // save
    saveToLocalStorage()
    // render pallet
    renderColorPallet()
}

const handleCopyColor = (copyId) => {
    let currentPallet = returnCurrentPallet()
    let copyColorData = currentPallet.colors.find(color => color.id === copyId)
    // set value of hidden input
    $(copy_color_hidden_input).val(copyColorData.color)
    // copy
    copyFunction(copy_color_hidden_input)
}

const handleRemoveColor = (colorId) => {
    let currentPallet = returnCurrentPallet()
    let newPallet = new ColorPallet
    newPallet.replacePallet(currentPallet.colors)
    // remove color
    newPallet.removeColor(colorId)
    // set active to false
    setActivePalletsToFalse()
    // add pallet to global
    global_app_data.e_color_pallet.push(newPallet)
    // save
    saveToLocalStorage()
    // render pallet
    renderColorPallet()
}
// **************************************************
// GENERATION
//generate SVG with data
const generateSVG = () => {
    let data = returnCurrentPallet()
    console.log("about to create svg: ", data)
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", data.colors.length * 150);
    svg.setAttribute("height", "350");

    data.colors.forEach((item, index) => {
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", index * 150);
        rect.setAttribute("y", 0);
        rect.setAttribute("width", "150");
        rect.setAttribute("height", "350");
        rect.setAttribute("fill", item.color);
        svg.appendChild(rect);
    });

    return svg;
}
// create svg blob
const downloadSVG = (svgElement) => {
    const serializer = new XMLSerializer();
    const svgBlob = new Blob([serializer.serializeToString(svgElement)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `pallet-${createId()}.svg`; // Name of the file to be downloaded
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink); // Clean up
}

// download PNG type
function downloadPNG(svgElement) {
    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    // Create an Image element to load the SVG blob
    const image = new Image();
    image.onload = function () {
        // Draw the image onto a canvas
        const canvas = document.createElement('canvas');
        canvas.width = svgElement.width.baseVal.value;
        canvas.height = svgElement.height.baseVal.value;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        // Convert canvas to PNG data URL and trigger download
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `pallet-${createId()}.png`; // Name of the file to be downloaded
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink); // Clean up
    };
    image.src = blobURL;
}

// generate css output
const generateCSSOutput = () => {
    let currentPallet = returnCurrentPallet()
    let output = []
    output.push(":root{")
    currentPallet.colors.forEach(c => {
        let colorVar = `--project_name-color_type: ${c.color};`
        output.push(colorVar)
    })
    output.push("}")
    return output.join("\r\n")
}
// generate hex output
const generateHEXOutput = () => {
    let currentPallet = returnCurrentPallet()
    let output = []
    let i = 1
    currentPallet.colors.forEach(c => {

        let colorVar = `Color-${i}: ${c.color}`
        output.push(colorVar)
        i++
    })
    return output.join("\r\n")
}

$(() => {
    loadColorPallet()
    // handle color item setting buttons
    $(".e_color_pallet_cont").on("click", ".color_pallet_item_setting_btn", function () {
        let buttonType = $(this).data("btntype");
        let buttonId = $(this).data("colorid");
        console.log(buttonId + " : " + buttonType)
        // handle locking a color
        if (buttonType === "lock") {
            handleLockColor(buttonId)
        }
        // handle copying a color
        if (buttonType === "copy") {
            handleCopyColor(buttonId)
        }
        // handle removing a color
        if (buttonType === "remove") {
            handleRemoveColor(buttonId)
        }

    })

    // handle adding a new color at index

    $(".e_color_pallet_cont").on("click", ".color_pallet_item_add_btn", function () {
        let buttonIndex = $(this).data("addcolorindex");
        console.log("Add button clicked!")
        // create color
        generateSingleColorAtIndex(buttonIndex)
    })

    // generate colors button
    $(generate_colors_btn).on("click", (e) => {
        // generate amount of colors
        generateUnlockedColors()
    })

    // open the download menu
    color_pallet_download_btn.on('click', () => {
        if (downloadPalletMenuOpen) {
            // close menu
            closeDownloadMenu()
        } else {
            // open menu
            console.log("Opening download menu")
            $(".e_pallet_download_drop_down_cont").addClass("active")
            downloadPalletMenuOpen = true
        }

        // close download menu
        $(document).on("click", function (event) {
            // Check if the click event target is not within the menu
            if (!e_pallet_download_drop_down_cont.is(event.target) && downloadPalletMenuOpen && !color_pallet_download_btn.is(event.target) && e_pallet_download_drop_down_cont.has(event.target).length === 0) {

                closeDownloadMenu()
            }
        });
    })


    // download Actions
    // download SVG
    e_pallet_download_svg_btn.on("click", (e) => {
        e.preventDefault()
        console.log("Clicked download SVG Button")
        // svg element
        const svgElement = generateSVG(global_app_data.e_color_pallet);

        downloadSVG(svgElement)
    })
    // download SVG
    e_pallet_download_png_btn.on("click", (e) => {
        e.preventDefault()
        console.log("Clicked download PNG Button")
        // svg element
        const svgElement = generateSVG();

        downloadPNG(svgElement)
    })

    // copy css
    e_pallet_copy_css_btn.on("click", e => {
        if (e_color_pallet_css_output.val() === "") {
            sendNotification("fast", 3000, "Please Generate colors before copying.")
            return
        } else {
            copyFunction(e_color_pallet_css_output)
        }
    })
    // copy hex codes
    e_pallet_copy_hex_btn.on("click", e => {
        if (e_color_pallet_hex_output.val() === "") {
            sendNotification("fast", 3000, "Please Generate colors before copying.")
            return
        } else {
            copyFunction(e_color_pallet_hex_output)
        }

    })

})