import * as shortid from "https://cdn.skypack.dev/shortid@2.2.16";
import html2canvasDpi from "https://cdn.skypack.dev/html2canvas-dpi@0.4.8";

// PLEASE REFERENCE ME IF YOU CHOOSE TO FORK THIS PROJECT! :)""
// github https://github.com/Ruffmantom
$(document).ready(function () {
    // got list from google
    // const colorList = [
    //   "#FFFFFF",
    //   "#FFFF99",
    //   "#FFFDD0",
    //   "#FFFAF0",
    //   "#FFF600",
    //   "#FFF8E7",
    //   "#FFF8DC",
    //   "#FFEF00",
    //   "#FFEBCD",
    //   "#FFE4C4",
    //   "#FFD300",
    //   "#FFC680",
    //   "#FFBF00",
    //   "#FFBCD9",
    //   "#FFB200",
    //   "#FFB7C5",
    //   "#FFAA1D",
    //   "#FFA700",
    //   "#FFA6C9",
    //   "#FF9966",
    //   "#FF9933",
    //   "#FF5470",
    //   "#FF3800",
    //   "#FF1493",
    //   "#FF0800",
    //   "#FF91AF",
    //   "#FF55A3",
    //   "#FF8C00",
    //   "#FF7F50",
    //   "#FF7E00",
    //   "#FF00FF",
    //   "#FEFEFA",
    //   "#FE6F5E",
    //   "#FDEE00",
    //   "#FD6C9E",
    //   "#FD3F92",
    //   "#FBEC5D",
    //   "#FBCEB1",
    //   "#FB607F",
    //   "#FAF0BE",
    //   "#FAEBD7",
    //   "#FAE7B5",
    //   "#FAD6A5",
    //   "#F88379",
    //   "#F88379",
    //   "#F400A1",
    //   "#F64A8A",
    //   "#F56FA1",
    //   "#F19CBB",
    //   "#F7E7CE",
    //   "#F5F5F5",
    //   "#F5F5DC",
    //   "#F4C2C2",
    //   "#F1DDCF",
    //   "#F0FFFF",
    //   "#F0F8FF",
    //   "#F0EAD6",
    //   "#EFDFBB",
    //   "#EFDECD",
    //   "#EFBBCC",
    //   "#EEDC82",
    //   "#EDEAE0",
    //   "#EDC9AF",
    //   "#ED9121",
    //   "#ED872D",
    //   "#E97451",
    //   "#E48400",
    //   "#E34234",
    //   "#E30022",
    //   "#E25822",
    //   "#E9967A",
    //   "#E4717A",
    //   "#E936A7",
    //   "#E95C4B",
    //   "#E68FAC",
    //   "#E52B50",
    //   "#E23D28",
    //   "#E9D66B",
    //   "#E5AA70",
    //   "#E4D00A",
    //   "#E3DAC9",
    //   "#E03C31",
    //   "#E1A95F",
    //   "#DFFF00",
    //   "#DEB887",
    //   "#DE5285",
    //   "#DE3163",
    //   "#DE6FA1",
    //   "#DE5D83",
    //   "#DC143C",
    //   "#DA3287",
    //   "#DA1884",
    //   "#DA8A67",
    //   "#D71868",
    //   "#D70040",
    //   "#D3212D",
    //   "#D2691E",
    //   "#D2691E",
    //   "#D891EF",
    //   "#D473D4",
    //   "#D0FF14",
    //   "#CE2029",
    //   "#CD9575",
    //   "#CD607E",
    //   "#CD7F32",
    //   "#CCFF00",
    //   "#CC5500",
    //   "#CC474B",
    //   "#CC397B",
    //   "#CB4154",
    //   "#CB6D51",
    //   "#CAE00D",
    //   "#C74375",
    //   "#C46210",
    //   "#C32148",
    //   "#C154C1",
    //   "#C95A49",
    //   "#C72C48",
    //   "#C41E3A",
    //   "#C19A6B",
    //   "#C19A6B",
    //   "#C19A6B",
    //   "#C2B280",
    //   "#C0E8D5",
    //   "#BFFF00",
    //   "#BFAFB2",
    //   "#BF4F51",
    //   "#BF00FF",
    //   "#BDB76B",
    //   "#BD33A4",
    //   "#BCD4E6",
    //   "#B87333",
    //   "#B53389",
    //   "#B48395",
    //   "#B22222",
    //   "#B8860B",
    //   "#B284BE",
    //   "#B94E48",
    //   "#B31B1B",
    //   "#B31B1B",
    //   "#B9D9EB",
    //   "#B2FFFF",
    //   "#B2BEB5",
    //   "#B0BF1A",
    //   "#AF6E4D",
    //   "#AD6F69",
    //   "#ACE5EE",
    //   "#ACE1AF",
    //   "#AB274F",
    //   "#AB4B52",
    //   "#AA381E",
    //   "#A57164",
    //   "#A8516E",
    //   "#A2006D",
    //   "#A67B5B",
    //   "#A67B5B",
    //   "#A52A2A",
    //   "#A17A74",
    //   "#A9B2C3",
    //   "#A7D8DE",
    //   "#A4C639",
    //   "#A3C1AD",
    //   "#A2A2D0",
    //   "#A1CAF1",
    //   "#996666",
    //   "#967117",
    //   "#967117",
    //   "#960018",
    //   "#954535",
    //   "#856088",
    //   "#848482",
    //   "#801818",
    //   "#800020",
    //   "#703642",
    //   "#702963",
    //   "#696969",
    //   "#666699",
    //   "#660000",
    //   "#654321",
    //   "#614051",
    //   "#592720",
    //   "#568203",
    //   "#555555",
    //   "#536878",
    //   "#536872",
    //   "#333399",
    //   "#301934",
    //   "#177245",
    //   "#126180",
    //   "#98817B",
    //   "#88540B",
    //   "#87421F",
    //   "#87413F",
    //   "#86608E",
    //   "#81613C",
    //   "#79443B",
    //   "#58427C",
    //   "#58111A",
    //   "#54626F",
    //   "#36454F",
    //   "#26428B",
    //   "#16161D",
    //   "#014421",
    //   "#013220",
    //   "#9966CC",
    //   "#9932CC",
    //   "#9400D3",
    //   "#8806CE",
    //   "#008000",
    //   "#7366BD",
    //   "#6699CC",
    //   "#6495ED",
    //   "#006400",
    //   "#5072A7",
    //   "#004225",
    //   "#2243B6",
    //   "#1974D2",
    //   "#1560BD",
    //   "#1034A6",
    //   "#915C83",
    //   "#893F45",
    //   "#856D4D",
    //   "#841B2D",
    //   "#00703C",
    //   "#665D1E",
    //   "#00563F",
    //   "#563C5C",
    //   "#556B2F",
    //   "#555D50",
    //   "#543D37",
    //   "#534B4F",
    //   "#483D8B",
    //   "#483C32",
    //   "#318CE7",
    //   "#0247FE",
    //   "#246BCE",
    //   "#232B2B",
    //   "#228B22",
    //   "#96C8A2",
    //   "#0093AF",
    //   "#91A3B0",
    //   "#89CFF0",
    //   "#0087BD",
    //   "#87A96B",
    //   "#77B5FE",
    //   "#0072BB",
    //   "#72A0C1",
    //   "#66FF00",
    //   "#064E40",
    //   "#56A0D3",
    //   "#50C878",
    //   "#0048BA",
    //   "#0047AB",
    //   "#0018A8",
    //   "#15F4EE",
    //   "#9FA91F",
    //   "#9F8170",
    //   "#9F2B68",
    //   "#9EFD38",
    //   "#9E1B32",
    //   "#9C2542",
    //   "#00009C",
    //   "#8FBC8F",
    //   "#8F9779",
    //   "#8F00FF",
    //   "#8DB600",
    //   "#8CBED6",
    //   "#8C92AC",
    //   "#008B8B",
    //   "#8B008B",
    //   "#8B0000",
    //   "#8A3324",
    //   "#8A2BE2",
    //   "#7FFFD4",
    //   "#7FFF00",
    //   "#007FFF",
    //   "#7F1734",
    //   "#7E5E60",
    //   "#7DF9FF",
    //   "#7CB9E8",
    //   "#7C0A02",
    //   "#7BB661",
    //   "#007BA7",
    //   "#007BA7",
    //   "#7B3F00",
    //   "#007AA5",
    //   "#6F4E37",
    //   "#6F00FF",
    //   "#6D9BC3",
    //   "#6C3082",
    //   "#6C541E",
    //   "#006B3C",
    //   "#006A4E",
    //   "#5FA777",
    //   "#5F9EA0",
    //   "#5DADEC",
    //   "#5D3954",
    //   "#4F7942",
    //   "#4D5D53",
    //   "#4D1A7F",
    //   "#4B5320",
    //   "#4B3621",
    //   "#004B49",
    //   "#4A646C",
    //   "#4A5D23",
    //   "#3D2B1F",
    //   "#3D0C02",
    //   "#3C1414",
    //   "#3C69E7",
    //   "#03C03C",
    //   "#3B7A57",
    //   "#3B3C36",
    //   "#3B2F2F",
    //   "#2F847C",
    //   "#2F4F4F",
    //   "#2E5894",
    //   "#2E2D88",
    //   "#2A52BE",
    //   "#1F75FE",
    //   "#1E90FF",
    //   "#1DACD6",
    //   "#1B1811",
    //   "#1B4D3E",
    //   "#1B1B1B",
    //   "#1A2421",
    //   "#00FFFF",
    //   "#00FF40",
    //   "#00FF00",
    //   "#0000FF",
    //   "#0D98BA",
    //   "#00CED1",
    //   "#00CC99",
    //   "#00BFFF",
    //   "#00B7EB",
    //   "#1F1F1F"
    // ];
    // adding code from hex generator -------------------------------
    let colorsReady = false;
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
    var colorList = [];
    // make function to return random value from array

    function randomValue(colorBuild) {
        var ranIndex = Math.floor(Math.random() * 15) + 1;
        return c[ranIndex];
    }

    function buildHex() {
        let colorBuild = "";
        for (let i = 0; i <= 5; i++) {
            colorBuild += randomValue(colorBuild);
        }
        // console.log(colorBuild);
        //at the end of building the color then push into color array
        colorList.push(colorBuild);
    }

    function generateColors() {
        // want to genterate 100 colors then put them into div
        // so hex will go from 1 "0" to 1 'F' F comes after 9 in the sequence
        for (var i = 0; i <= 500 - 1; i++) {
            buildHex();
        }
        // console.log(colorList);
        colorsReady = true;
        console.log(colorsReady);
    }
    // dont want to run this till everything is ready
    generateColors();
    // end of hex generator -----------------------------------------
    var colorsSorted = colorList.sort(function (a, b) {
        return a === b ? 0 : a < b ? -1 : 1;
    });
    console.log(colorsSorted)
    // -----------
    const chosenColorDiv = $(".chosen-color");
    const colorCont = $(".colors-cont");
    const preview = $(".preview-color");
    let colorHasBeenChosen = false;
    let colorPallet = [];
    let chosenColorMain = "white";
    if (colorsReady) {
        // sorted colors being loaded
        colorsSorted.map((c, i) => {
            colorCont.append(() => {
                return `<div class="color" style="background-color:#${c}" data-colVal="#${c}" alt="#${c}"></div>`;
            });
        });
    }

    //default color
    chosenColorDiv.text("#FFFFF");
    const color = $(".color");
    color.click(function (e) {
        var colorVal = $(this).attr("data-colVal");
        if (e) {
            chosenColorDiv.text(colorVal);
            chosenColorMain = colorVal;
            preview.css("background", `${colorVal}`);
        }
    });

    //want to display the cc-options when hovering the square
    let cOptionsOpen = false;
    const ccOptions = $(".cc-options");
    preview.mouseenter(function (e) {
        if (e) {
            // setting open to true
            cOptionsOpen = true;
            //if open is true then add class
            if (cOptionsOpen) {
                ccOptions.addClass("cc-o-open");
                $("#call-to-action").hide();
            } else {
                ccOptions.removeClass("cc-o-open");
                $("#call-to-action").show();
            }
        }
    });
    preview.mouseleave(function (e) {
        if (e && cOptionsOpen) {
            cOptionsOpen = false;
            ccOptions.removeClass("cc-o-open");
            $("#call-to-action").show();
        }
    });
    //annotations for copy and add to pallet
    const copyIcon = $(".fa-copy");
    const addIcon = $(".fa-plus-square");
    const copyText = $(".copy");
    const addToPalletText = $(".atp");
    // add way to save pallet
    // when page loads
    $(".cp-btn").css("display", "none");
    $(".preview-canvas-cont").hide();
    // update function for when pallet color gets added
    const checkUpdate = () => {
        if (colorPallet.length >= 1) {
            $(".cp-btn").show();
        } else {
            $(".cp-btn").hide();
            $(".cp-details").css("display", "block");
        }
    };
    // Save pallet as image
    const cpElement = $(".cp-cont");
    var getCanvas;

    // on click function to save
    // code help from https://forums.asp.net/t/2143285.aspx?want+to+export+div+with+image+and+content+to+image+in+jQuery+or+JS+
    $("#preview").click((e) => {
        if (e) {
            $(".preview-canvas-cont").css("display", "block");
        }
        html2canvas(cpElement, {
            dpi: 300,
            onrendered: function (canvas) {
                $(".canvas-area").append(canvas);
                getCanvas = canvas;
            }
        });
    });
    $("#save-img").click(() => {
        var imageData = getCanvas.toDataURL("image/png");
        var newData = imageData.replace(
            /^data:image\/png/,
            "data:application/octet-stream"
        );
        $("#save-img").attr("download", "colorPallet.png").attr("href", newData);
    });
    //   close the preview and delete the pallet image so it doesnt append to the existing
    $("#close-preview").click((e) => {
        if (e) {
            $(".preview-canvas-cont").hide();
            $("canvas").remove();
        }
    });
    // --------------------------
    copyIcon.mouseenter((e) => {
        if (e) {
            copyText.fadeIn("250ms");
            copyText.addClass("annot-open");
        }
    });
    copyIcon.mouseleave((e) => {
        if (e) {
            copyText.fadeOut("1ms");
            copyText.removeClass("annot-open");
        }
    });
    addIcon.mouseenter((e) => {
        if (e) {
            addToPalletText.fadeIn("250ms");
            addToPalletText.addClass("annot-open");
        }
    });
    addIcon.mouseleave((e) => {
        if (e) {
            addToPalletText.fadeOut("1ms");
            addToPalletText.removeClass("annot-open");
        }
    });
    // click on copy it will copy the color ----------------------------------------------
    let confirmOpen = false;
    copyIcon.click((e) => {
        // source for copy code https://www.sharmaprakash.com.np/javascript/copying-value-from-variable-to-clipboard/
        var invisInput = $(".i-i").val(chosenColorMain).select();
        document.execCommand("copy");
        if (e && !confirmOpen) {
            confirmOpen = true;
            $(".confirmation").text("Color Has Been Copied!");
            $(".confirmation").addClass("c-open");
            confirmOpen = false;
            setTimeout(() => {
                $(".confirmation").removeClass("c-open");
            }, 3500);
        }
    });

    // set message to add to pallet ----------------------------------------------
    if (colorPallet.length <= 0) {
        $(".cp-details").css("display", "block");
    }
    // color pallet functionality ------------------------------------------------------------------
    // Click add to Pallet
    addIcon.click((e) => {
        //add color to array
        if (e && !confirmOpen) {
            confirmOpen = true;
            let colorObj = {
                color: chosenColorMain,
                _id: shortid.generate()
            };
            // console.log("this is the Pallet OBJ");
            // console.log(colorObj);
            // console.log(colorPallet);
            colorPallet.push(colorObj);
            // append color to pallet
            //function to get text color
            const getColorText = (colorData) => {
                let splitHex = colorData.split("");
                if (
                    splitHex[1].toLowerCase() === "f" ||
                    splitHex[1].toLowerCase() === "a" ||
                    splitHex[1].toLowerCase() === "e" ||
                    splitHex[1].toLowerCase() === "c" ||
                    splitHex[1].toLowerCase() === "d" ||
                    splitHex[1].toLowerCase() === "b"
                ) {
                    return "color:#1B1811";
                } else {
                    return "color:#FFFFFF";
                }
            };

            if (colorPallet.length >= 1) {
                $(".cp-details").css("display", "none");
                $(".cp-cont").append(
                    `<div class="cp-color" data-colorid="${colorObj._id
                    }" style="background:${colorObj.color}">
              <p class="cp-i-text" style="${getColorText(colorObj.color)}">${colorObj.color
                    }</p>
              <div class="cp-c-options">
                <i class="far fa-copy click-icon cpy-btn" data-copyid="${colorObj.color
                    }"></i>
                <i class="far fa-trash-alt click-icon" data-deleteid="${colorObj._id
                    }"></i>
              </div> 
           </div>`
                );
            }
            checkUpdate();
            // set confirmation
            $(".confirmation").text(
                `Color ${colorObj.color} Has Been added to your pallet!`
            );
            $(".confirmation").addClass("c-open");
            confirmOpen = false;
            setTimeout(() => {
                $(".confirmation").removeClass("c-open");
            }, 3500);
        }
    });

    // when hovering over color in pallet show options and name
    $(".cp-cont").on("mouseenter", ".cp-color", function () {
        $(this).children().show();
    });
    $(".cp-cont").on("mouseleave", ".cp-color", function () {
        $(this).children().hide();
    });

    // add Color names to pallet color and options to copy/ remove color
    $(".cp-cont").on("click", ".click-icon", function () {
        // will need to remove color that matched the data id coming from delete btn
        var deleteId = $(this).data("deleteid");
        // var colorId = $(this).children('.cp-color')
        // console.log("About to delete " + deleteId + " From Pallet")
        $(".cp-color")
            .filter(function () {
                // console.log($(this).data("colorid"))
                return $(this).data("colorid") === deleteId;
            })
            .remove();
        // will need to delete it from the pallet array
        colorPallet = colorPallet.filter((x) => {
            return x._id != deleteId;
        });
        // will need to check update if no more colors are in the pallet
        checkUpdate();
    });
    // copy hex from color in pallet
    $(".color-pallet").on("click", ".cpy-btn", function (e) {
        var copyHex = $(this).data("copyid");
        var invisInput = $(".i-i").val(copyHex).select();
        document.execCommand("copy");
        if (e && !confirmOpen) {
            confirmOpen = true;
            $(".confirmation").text(`Color ${copyHex} Has Been Copied!`);
            $(".confirmation").addClass("c-open");
            confirmOpen = false;
            setTimeout(() => {
                $(".confirmation").removeClass("c-open");
            }, 3500);
        }
    });
    // clear pallet
    $(".color-pallet").on("click", "#clear-pallet-btn", function () {
        $(".cp-cont").empty();
        colorPallet = [];
        checkUpdate();
    });

    // add way to copy all hex codes as CSS line
    $("#copy-all").click((e) => {
        var copyText = `.colors{ ${colorPallet.map((d) => {
            return `color: ${d.color};`;
        }).join(' ')}}`;
        var invisInput = $(".i-i").val(copyText).select();
        document.execCommand("copy");
        if (e && !confirmOpen) {
            confirmOpen = true;
            $(".confirmation").text(`Your Color Pallet Has Been Copied!`);
            $(".confirmation").addClass("c-open");
            confirmOpen = false;
            setTimeout(() => {
                $(".confirmation").removeClass("c-open");
            }, 3500);
        }
    });
    //----------------------------------
    //end of Document.ready
});
