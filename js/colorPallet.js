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

// color helpers
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    // 3 digits
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 digits
    else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return [r, g, b];
}
function interpolateColors(color1, color2) {
    // Helper function to convert RGB to hex
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    // Convert both colors to RGB
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    // Calculate the midpoint for each component
    const midpointRgb = rgb1.map((component, index) => Math.round((component + rgb2[index]) / 2));

    // Convert the midpoint RGB back to hex
    return rgbToHex(...midpointRgb);
}


function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
    let r, g, b;
    h /= 360, s /= 100, l /= 100;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rotateHue(hex, angle) {
    const [r, g, b] = hexToRgb(hex);
    let [h, s, l] = rgbToHsl(r, g, b);

    h = (h + angle) % 360; // Rotate the hue
    if (h < 0) h += 360; // Ensure hue stays in the 0-360 range

    const [newR, newG, newB] = hslToRgb(h, s, l);
    return rgbToHex(newR, newG, newB);
}


// get Complimentary Colors
function getComplementaryColor(hex) {
    const color = parseInt(hex.slice(1), 16); // Remove # and convert to integer
    const complementary = 0xFFFFFF ^ color; // Invert the color
    return "#" + complementary.toString(16).padStart(6, '0');
}
// get Two Complimentary Colors
function getSplitComplementaryColors(hex) {
    const complementary = getComplementaryColor(hex);
    const split1 = rotateHue(complementary, -150);
    const split2 = rotateHue(complementary, 150);
    return [hex, split1, split2];
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
    // Get the colors at index and before
    let colorA = currentPallet.colors[addIndex].color
    let colorB = currentPallet.colors[addIndex >= currentPallet.colors.length ? addIndex + 1 : addIndex - 1].color
    let analogousColor = interpolateColors(colorA, colorB)
    console.log("Color A: ", colorA)
    console.log("Color B: ", colorB)
    console.log("Analogous Color: ", analogousColor)
    // create color
    let newColor = {
        id: createId(),
        color: analogousColor,
        isLocked: false,
    }
    // add new color at index
    if (addIndex === 0) {
        let newIndex = addIndex + 1
        // global_app_data.e_color_pallet.splice(addIndex + 1, 0, newColor);
        newPallet.addColorAtIndex(newIndex, newColor)
    } else {
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
    generateCSSOutput()
    generateHEXOutput()

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

// delete old entries
const palletCleanUp = (limit = 30) => {
    // remove all history up to the latest 30
    let cleanedArr = global_app_data.e_color_pallet.slice(-limit);
    global_app_data.e_color_pallet = cleanedArr
    // save to local
    saveToLocalStorage()
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
    let currPallet = returnCurrentPallet()
    console.log("Getting current pallet: ", currPallet, " Setting CSS Output")
    let output = []
    output.push(":root{")
    currPallet.colors.forEach(c => {
        let colorVar = `--project_name-color_type: ${c.color};`
        output.push(colorVar)
    })
    output.push("}")

    // set elements val
    e_color_pallet_css_output.val(output.join("\r\n"))
}
// generate hex output
const generateHEXOutput = () => {
    let currPallet = returnCurrentPallet()
    console.log("Getting current pallet: ", currPallet, " Setting HEX Output")
    let output = []
    let i = 1
    currPallet.colors.forEach(c => {

        let colorVar = `Color-${i}: ${c.color}`
        output.push(colorVar)
        i++
    })
    // set elements val
    e_color_pallet_hex_output.val(output.join("\r\n"))
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
        // clean up
        palletCleanUp()

    })

    // handle adding a new color at index
    $(".e_color_pallet_cont").on("click", ".color_pallet_item_add_btn", function () {
        let buttonIndex = $(this).data("addcolorindex");
        console.log("Add button clicked!")
        // create color
        generateSingleColorAtIndex(buttonIndex)
        // clean up
        palletCleanUp()
    })

    // generate colors button
    $(generate_colors_btn).on("click", (e) => {
        // generate amount of colors
        generateUnlockedColors()
        // clean up
        palletCleanUp()
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
            // generate outputs
            generateCSSOutput()
            generateHEXOutput()
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