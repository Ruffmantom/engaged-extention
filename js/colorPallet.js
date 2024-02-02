let colorData = []
var c = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
];
function returnRandomCodeIndex() {
    var ranIndex = Math.floor(Math.random() * 15) + 1;
    return c[ranIndex];
}

function generateRandomColor() {
    let colorBuild = "";
    for (let i = 0; i <= 5; i++) {
        colorBuild += returnRandomCodeIndex(colorBuild);
    }
    // console.log(colorBuild);
    //at the end of building the color then push into color array
    return colorBuild
}
// beginning of app
const generateFirstFiveColors = () => {
    let genColors = []
    for (let index = 0; index < 5; index++) {
        let newColor = {
            id: createId(),
            color: `#${generateRandomColor()}`,
            isLocked: false,
        }
        genColors.push(newColor)

    }

    global_app_data.e_color_pallet = genColors

}
const renderColorPallet = () => {
    $(".e_color_pallet_cont").empty()
    global_app_data.e_color_pallet.map((color, index) => {
        $(".e_color_pallet_cont").append(createColorPalletItem(color, index, global_app_data.e_color_pallet.length, global_app_data.e_color_pallet_limit))
    })
}


const generateSingleColorAtIndex = (addIndex) => {
    console.log("about to create new color at index: " + addIndex)
    // create color
    let newColor = {
        id: createId(),
        color: `#${generateRandomColor()}`,
        isLocked: false,
    }
    // add new color at index
    if (addIndex === 0) {
        global_app_data.e_color_pallet.splice(addIndex + 1, 0, newColor);
    } else {
        global_app_data.e_color_pallet.splice(addIndex + 1, 0, newColor);
    }
    // save to local
    saveToLocalStorage()
    // render new color
    renderColorPallet()
}

const generateUnlockedColors = () => {
    let currentPallet = global_app_data.e_color_pallet
    // foreach color, check if locked, if locked skip
    currentPallet.forEach((c, index) => {
        if (!c.isLocked) {
            // create color
            let newColor = {
                id: createId(),
                color: `#${generateRandomColor()}`,
                isLocked: false,
            }
            // replace this color
            currentPallet.splice(index, 1, newColor)
        }
    })
    // save current pallet to global
    global_app_data.e_color_pallet = currentPallet
    // save
    saveToLocalStorage()
    // render pallet
    renderColorPallet()
}

// close menu
const closeDownloadMenu = () => {
    if (downloadPalletMenuOpen) {
        $(".e_pallet_download_drop_down_cont").removeClass("active")
        downloadPalletMenuOpen = false
    }
}

//generate SVG with data
const generateSVG = (data) => {
    console.log("about to create svg: ", data)
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", data.length * 150);
    svg.setAttribute("height", "350");

    data.forEach((item, index) => {
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
// create svg blob
const downloadPDF = (svgElement) => {
    const serializer = new XMLSerializer();
    const svgBlob = new Blob([serializer.serializeToString(svgElement)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `pallet-${createId()}.pdf`; // Name of the file to be downloaded
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

// color pallet history
// const saveCurrentPalletToPrevious = () => {
//     let colorPallet = {
//         id: createId(),
//         pallet: global_app_data.e_color_pallet,
//         updatedAt: createDate()
//     }
//     global_app_data.e_color_pallet_history.push(colorPallet)
// }
// const returnPreviousColorPallet = () => {

// }

$(() => {
    // only render a new set of colors if there is none that have been generated previously.
    if (global_app_data.e_color_pallet.length === 0) {
        // loadColorPallet
        generateFirstFiveColors()
    }
    // render on load
    renderColorPallet()

    // handle color item setting buttons
    $(".e_color_pallet_cont").on("click", ".color_pallet_item_setting_btn", function () {
        let buttonType = $(this).data("btntype");
        let buttonId = $(this).data("colorid");
        console.log(buttonId + " : " + buttonType)
        // handle locking a color
        if (buttonType === "lock") {
            global_app_data.e_color_pallet.forEach(color => {
                color.id === buttonId ? color.isLocked = !color.isLocked : ""
            });
            // console.log(global_app_data.e_color_pallet)
            saveToLocalStorage()
            // set icon to the locked icon
            // this is a temporary re render, I will need to make this more seamless, but for now, it works
            renderColorPallet()
        }
        // handle copying a color
        if (buttonType === "copy") {
            let copyColorData = global_app_data.e_color_pallet.find(color => color.id === buttonId)
            // set value of hidden input
            $(copy_color_hidden_input).val(copyColorData.color)
            // copy
            copyFunction(copy_color_hidden_input)
        }
        // handle removing a color
        if (buttonType === "remove") {
            // remove from global
            let updatedColorPallet = global_app_data.e_color_pallet.filter(c => {
                return c.id !== buttonId
            })
            global_app_data.e_color_pallet = updatedColorPallet
            // save to local
            saveToLocalStorage()
            // update ui
            renderColorPallet()
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

    // open the todo list menu
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

        // close todo list menu
        $(document).on("click", function (event) {
            // Check if the click event target is not within the menu
            if (!e_pallet_download_drop_down_cont.is(event.target) && downloadPalletMenuOpen && !color_pallet_download_btn.is(event.target) && e_pallet_download_drop_down_cont.has(event.target).length === 0) {

                closeDownloadMenu()
            }
        });
    })


    // action on space bar press
    // $(document).on('keydown', function (event) {
    //     if (event.key === " ") {
    //         // event.preventDefault();
    //         // need to make a way where the key down only is recognized on the color pallet tab
    //         // clear array
    //         colorData = []
    //         console.log(colorData)
    //         let newColors = generateFirstFiveColors()
    //         console.log(newColors)
    //         colorData = newColors
    //         // re render ui
    //         renderColorPallet()
    //     }
    // });


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
        const svgElement = generateSVG(global_app_data.e_color_pallet);

        downloadPNG(svgElement)
    })
    // download PDF
    // *************** Would need to add jsPDF library to make this work
    // e_pallet_download_pdf_btn.on("click", (e) => {
    //     e.preventDefault()
    //     console.log("Clicked download PDF Button")
    //     // svg element
    //     const svgElement = generateSVG(global_app_data.e_color_pallet);

    //     downloadPDF(svgElement)
    // })

})