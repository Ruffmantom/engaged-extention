class ColorPallet {
  constructor() {
    this.id = this.makeId();
    this.colors = [];
    this.active = true;
  }

  makeId() {
    return createId();
  }

  setPallet(pallet) {
    // Deep clone each color object in the array to avoid reference issues
    this.colors = pallet.map(color => ({ ...color }));
  }

  addColor(color) {
    this.colors.push(color);
  }

  addColorAtIndex(colorIndex, newColor) {
    this.colors.splice(colorIndex, 0, newColor);
  }

  removeColor(colorId) {
    this.colors = this.colors.filter((c) => c.id !== colorId);
  }

  replaceColor(colorIndex, newColor) {
    this.colors.splice(colorIndex, 1, newColor);

  }

  toggleActive() {
    this.active = !this.active;
  }

  lockColor(lockId) {
    this.colors.forEach((color) => {
      color.id === lockId ? (color.isLocked = !color.isLocked) : "";
    });
  }

  rearrangeColors(sortedIds) {
    let currentColors = this.colors
    // console.log(currentColors)
    currentColors.sort((a, b) => {
      return sortedIds.indexOf(a.id) - sortedIds.indexOf(b.id);
    });

    this.colors = currentColors
  }

  changeColor(hex, id) {
    let foundColorName = findColorName(hex);
    this.colors.forEach((h) => {
      if (h.id === id) {
        h.color = `#${hex}`;
        // replace name as well
        h.colorName = foundColorName;
      }
    });
  }
}

// color helpers
function hexToRgb(hex) {
  let r = 0,
    g = 0,
    b = 0;
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
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  }

  // Convert both colors to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Calculate the midpoint for each component
  const midpointRgb = rgb1.map((component, index) =>
    Math.round((component + rgb2[index]) / 2)
  );

  // Convert the midpoint RGB back to hex
  return rgbToHex(...midpointRgb);
}

function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  (h /= 360), (s /= 100), (l /= 100);

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
  const complementary = 0xffffff ^ color; // Invert the color
  return "#" + complementary.toString(16).padStart(6, "0");
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
  return global_app_data.e_color_pallet.find((l) => l.active === true);
};
const returnCurrentPalletIndex = () => {
  return global_app_data.e_color_pallet.findIndex((l) => l.active);
};

const setActivePalletsToFalse = () => {
  // console.log("Setting all active lists to false: ", global_app_data.e_color_pallet)
  global_app_data.e_color_pallet.forEach((c) => {
    c.active = false;
  });
};

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
  return colorBuild;
}

function returnRandomColorFromLib() {
  const randomIndex = Math.floor(Math.random() * colorLib.length);
  return colorLib[randomIndex];
}

// when user first loads app, generate 5 colors
const generateFirstFiveColors = () => {
  let newPallet = new ColorPallet();
  for (let index = 0; index < 5; index++) {
    let returnedRandomColor = returnRandomColorFromLib();
    let newColor = {
      id: createId(),
      color: returnedRandomColor.hex,
      colorName: returnedRandomColor.colorName,
      isLocked: false,
    };
    newPallet.addColor(newColor);
  }
  global_app_data.e_color_pallet.push(newPallet);
  // save to local
  saveToLocalStorage();
};

const findAnalogousColorName = (hex) => {
  let name = "";
  // run through color list and find name if any
  colorLib.filter((c) => {
    if (c.hex === hex) {
      name = c.colorName;
    } else {
      name = undefined;
    }
  });
  return name;
};

// add / generate a new color at specified index
const generateSingleColorAtIndex = (addIndex) => {
  let currentPallet = returnCurrentPallet();
  // let currentColors = currentPallet.colors
  let newPallet = new ColorPallet();
  newPallet.setPallet(currentPallet.colors);
  // console.log("Current Pallet colors: ", currentPallet.colors)
  // console.log("Current colors before add at index: ", newPallet.colors)

  // Ensure addIndex is within bounds
  if (addIndex < 0 || addIndex >= currentPallet.colors.length) {
    // console.error("addIndex is out of bounds");
    return;
  }

  // Adjust colorB index calculation
  let colorBIndex = addIndex === 0 ? addIndex + 1 : addIndex - 1;
  let colorA = newPallet.colors[addIndex].color;
  let colorB = newPallet.colors[colorBIndex].color;

  let analogousColor = interpolateColors(colorA, colorB);
  let foundColorName = findAnalogousColorName(analogousColor);

  // Directly create the new color object with a ternary operator for colorName
  let newColor = {
    id: createId(),
    color: analogousColor,
    colorName: foundColorName || undefined,
    isLocked: false,
  };


  // Add the new color at the specified index
  newPallet.addColorAtIndex(addIndex, newColor);
  // console.log("Adding new color to index: ", newPallet.colors)

  // let newPallet = new ColorPallet();
  // newPallet.setPallet(currentColors);

  // console.log("New pallet after setting Pallet: ", newPallet.colors)
  // Update the palette
  addNewPalletMaster(currentPallet, newPallet);
};


// generate colors for unlocked colors
const generateUnlockedColors = () => {
  let currentPallet = returnCurrentPallet();
  let newPalletColors = currentPallet.colors.map(color => {
    if (!color.isLocked) {
      let { hex, colorName } = returnRandomColorFromLib();
      return {
        id: createId(),
        color: hex,
        colorName,
        isLocked: false,
      };
    }
    return color;
  });

  let newPallet = new ColorPallet();
  newPallet.setPallet(newPalletColors);

  addNewPalletMaster(currentPallet, newPallet);
};


// render and load UI
const renderColorPallet = () => {
  // get current pallet
  let currentPallet = returnCurrentPallet();
  // console.log("about to render pallet: ", currentPallet)
  $(".e_color_pallet_cont").empty();
  currentPallet.colors.map((colorPallet, index) => {
    $(".e_color_pallet_cont").append(
      createColorPalletItem(
        colorPallet,
        index,
        currentPallet.colors.length,
        global_app_data.e_color_pallet_limit
      )
    );
  });
};

// close menu
const closeDownloadMenu = () => {
  if (downloadPalletMenuOpen) {
    $(".e_pallet_download_drop_down_cont").removeClass("active");
    downloadPalletMenuOpen = false;
  }
};

// beginning of color pallet
const loadColorPallet = () => {
  // only render a new set of colors if there is none that have been generated previously.
  if (global_app_data.e_color_pallet.length === 0) {
    // loadColorPallet
    generateFirstFiveColors();
  }
  // render on load
  renderColorPallet();
  // load output for css
  generateCSSOutput();
  generateHEXOutput();
};
// copy color
const handleCopyColor = (copyId) => {
  let currentPallet = returnCurrentPallet();
  let copyColorData = currentPallet.colors.find((color) => color.id === copyId);
  // set value of hidden input
  $(copy_color_hidden_input).val(copyColorData.color);
  // copy
  copyFunction(copy_color_hidden_input);
};
// lock color
const handleLockColor = (lockId) => {
  let currentPallet = returnCurrentPallet();
  let newPallet = new ColorPallet();
  newPallet.setPallet(currentPallet.colors);
  // lock color
  newPallet.lockColor(lockId)
  // newPallet master function
  addNewPalletMaster(currentPallet, newPallet);
};
// remove color
const handleRemoveColor = (colorId) => {
  let currentPallet = returnCurrentPallet();
  let newPallet = new ColorPallet();
  newPallet.setPallet(currentPallet.colors);
  // remove color
  newPallet.removeColor(colorId);
  // newPallet master function
  addNewPalletMaster(currentPallet, newPallet);
};
// sorting based off user click and drag
const sortColorsMovedByUser = (sortedIds) => {
  // need to create a new pallet
  let newPallet = new ColorPallet();
  let currentPallet = returnCurrentPallet();
  newPallet.setPallet(currentPallet.colors);
  // console.log(sortedIds)
  // sort currentPallet pallet based on ids of sortedColors
  newPallet.rearrangeColors(sortedIds)
  // add pallet to state
  addNewPalletMaster(currentPallet, newPallet);
};

// delete old entries
const cleanPalletHistory = (limit = 30) => {
  // remove all history up to the latest 30
  let cleanedArr = global_app_data.e_color_pallet.slice(-limit);
  global_app_data.e_color_pallet = cleanedArr;
  // save to local
  saveToLocalStorage();
};

const cleanUpAfterUndo = () => {
  let activeIndex = returnCurrentPalletIndex();
  // console.log(activeIndex);
  // console.log(global_app_data.e_color_pallet.length);

  // Adjusted logic: Always truncate the array beyond the active pallet
  let updatedPallets = global_app_data.e_color_pallet.slice(0, activeIndex + 1);
  global_app_data.e_color_pallet = updatedPallets;
  // console.log("After clean", global_app_data.e_color_pallet);
  // save to local
  saveToLocalStorage();
};

// **************************************************
// GENERATION
//generate SVG with data
const generateSVG = () => {
  let data = returnCurrentPallet();
  // console.log("about to create svg: ", data)
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
};
// create svg blob
const downloadSVG = (svgElement) => {
  const serializer = new XMLSerializer();
  const svgBlob = new Blob([serializer.serializeToString(svgElement)], {
    type: "image/svg+xml",
  });
  const url = URL.createObjectURL(svgBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = `pallet-${createId()}.svg`; // Name of the file to be downloaded
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink); // Clean up
};

// download PNG type
function downloadPNG(svgElement) {
  // Serialize SVG to string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(svgBlob);

  // Create an Image element to load the SVG blob
  const image = new Image();
  image.onload = function () {
    // Draw the image onto a canvas
    const canvas = document.createElement("canvas");
    canvas.width = svgElement.width.baseVal.value;
    canvas.height = svgElement.height.baseVal.value;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    // Convert canvas to PNG data URL and trigger download
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
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
  let currPallet = returnCurrentPallet();
  // console.log("Getting current pallet: ", currPallet, " Setting CSS Output")
  let output = [];
  output.push(":root{");
  currPallet.colors.forEach((c) => {
    let colorVar = `--project_name-color_type: ${c.color};`;
    output.push(colorVar);
  });
  output.push("}");

  // set elements val
  e_color_pallet_css_output.val(output.join("\r\n"));
};
// generate hex output
const generateHEXOutput = () => {
  let currPallet = returnCurrentPallet();
  // console.log("Getting current pallet: ", currPallet, " Setting HEX Output")
  let output = [];
  let i = 1;
  currPallet.colors.forEach((c) => {
    let colorVar = `Color-${i}: ${c.color}`;
    output.push(colorVar);
    i++;
  });
  // set elements val
  e_color_pallet_hex_output.val(output.join("\r\n"));
};



// undo recent pallet
const undoAction = () => {
  // get current pallet
  let activeIndex = returnCurrentPalletIndex();

  if (activeIndex === 0) {
    return;
  } else {
    // go back one pallet
    // - first set the current active to false
    global_app_data.e_color_pallet[activeIndex].active = false;
    // - next set the previous index active to true
    global_app_data.e_color_pallet[activeIndex - 1].active = true;

    // save to local storage the undo 
    saveToLocalStorage()
    //render pallet
    renderColorPallet();
  }
};

// redo recent pallet
const redoAction = () => {
  // get current pallet
  let activeIndex = returnCurrentPalletIndex();
  if (activeIndex === global_app_data.e_color_pallet.length - 1) {
    return;
  } else {
    // go back one pallet
    // - first set the current active to false
    global_app_data.e_color_pallet[activeIndex].active = false;
    // - next set the previous index active to true
    global_app_data.e_color_pallet[activeIndex + 1].active = true;

    // save to local storage the undo
    saveToLocalStorage()
    //render pallet
    renderColorPallet();
  }
};

function addNewPalletMaster(currentPallet, newPallet) {
  console.log("Before addNewPalletMaster HISTORY: ", global_app_data.e_color_pallet)
  // Find the index of the current active palette
  let currentActiveIndex = returnCurrentPalletIndex()

  // Insert the new palette into the array
  if (currentActiveIndex !== -1 && currentActiveIndex < global_app_data.e_color_pallet.length - 1) {
    // Insert after the current active palette if it's not the last one
    global_app_data.e_color_pallet.splice(currentActiveIndex + 1, 0, newPallet);
  } else {
    // Otherwise, add to the end of the array
    global_app_data.e_color_pallet.push(newPallet);
  }

  // set current to false now
  currentPallet.active = false

  // check if action is after an undo
  cleanUpAfterUndo();
  // Update application state and UI as necessary
  saveToLocalStorage();
  renderColorPallet();
  console.log("After addNewPalletMaster HISTORY: ", global_app_data.e_color_pallet)
}


$(() => {
  // on load clean up if over 30
  cleanPalletHistory();
  loadColorPallet();
  // handle color item setting buttons
  $(".e_color_pallet_cont").on(
    "click",
    ".color_pallet_item_setting_btn",
    function () {
      let buttonType = $(this).data("btntype");
      let buttonId = $(this).data("colorid");
      // console.log(buttonId + " : " + buttonType)
      // handle locking a color
      if (buttonType === "lock") {
        handleLockColor(buttonId);
      }
      // handle copying a color
      if (buttonType === "copy") {
        handleCopyColor(buttonId);
      }
      // handle removing a color
      if (buttonType === "remove") {
        handleRemoveColor(buttonId);
      }
    }
  );

  // handle adding a new color at index
  $(".e_color_pallet_cont").on(
    "click",
    ".color_pallet_item_add_btn",
    function () {
      let buttonIndex = $(this).data("addcolorindex");
      // console.log("Add button clicked!")
      // create color
      generateSingleColorAtIndex(buttonIndex);
    }
  );

  // generate colors button
  $(generate_colors_btn).on("click", (e) => {
    // generate amount of colors
    generateUnlockedColors();
  });

  // open the download menu
  color_pallet_download_btn.on("click", () => {
    if (downloadPalletMenuOpen) {
      // close menu
      closeDownloadMenu();
    } else {
      // open menu
      // console.log("Opening download menu")
      $(".e_pallet_download_drop_down_cont").addClass("active");
      downloadPalletMenuOpen = true;
      // generate outputs
      generateCSSOutput();
      generateHEXOutput();
    }

    // close download menu
    $(document).on("click", function (event) {
      // Check if the click event target is not within the menu
      if (
        !e_pallet_download_drop_down_cont.is(event.target) &&
        downloadPalletMenuOpen &&
        !color_pallet_download_btn.is(event.target) &&
        e_pallet_download_drop_down_cont.has(event.target).length === 0
      ) {
        closeDownloadMenu();
      }
    });
  });

  // download Actions
  // download SVG
  e_pallet_download_svg_btn.on("click", (e) => {
    e.preventDefault();
    // console.log("Clicked download SVG Button")
    // svg element
    const svgElement = generateSVG(global_app_data.e_color_pallet);

    downloadSVG(svgElement);
  });
  // download SVG
  e_pallet_download_png_btn.on("click", (e) => {
    e.preventDefault();
    // console.log("Clicked download PNG Button")
    // svg element
    const svgElement = generateSVG();

    downloadPNG(svgElement);
  });

  // copy css
  e_pallet_copy_css_btn.on("click", (e) => {
    if (e_color_pallet_css_output.val() === "") {
      sendNotification("fast", 3000, "Please Generate colors before copying.");
      return;
    } else {
      copyFunction(e_color_pallet_css_output);
    }
  });
  // copy hex codes
  e_pallet_copy_hex_btn.on("click", (e) => {
    if (e_color_pallet_hex_output.val() === "") {
      sendNotification("fast", 3000, "Please Generate colors before copying.");
      return;
    } else {
      copyFunction(e_color_pallet_hex_output);
    }
  });

  // movable list
  $(".e_color_pallet_cont").sortable({
    handle: ".color_drag_handle",
    helper: "clone",
    cursorAt: { top: 150, left: 45 },
    tolerance: "pointer",
    update: function (event, ui) {
      var sortedIDs = $(this).sortable("toArray", { attribute: "id" });

      sortColorsMovedByUser(sortedIDs);
      // re-render list
    },
  });

  document.addEventListener("keydown", function (event) {
    $(".e_color_pallet_cont").disableSelection();

    // handle ctrl + z
    if (event.ctrlKey && event.key === "z") {
      // Prevent the default action to avoid conflicting with browser/OS shortcuts
      event.preventDefault();

      // Call your function here
      undoAction();

    }
  });

  // Check if 'Ctrl', 'Shift', and 'Z' are pressed together
  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.shiftKey && event.key === "Z") {
      // Prevent the default action to avoid conflicting with browser/OS shortcuts
      event.preventDefault();

      // Call your function here
      redoAction();
    }
  });

  // Use event delegation to handle clicks on dynamically created elements
  $(".e_color_pallet_cont").on(
    "click",
    ".e_color_pallet_item_text",
    function () {
      // Find the parent container of the clicked element
      var colorItem = $(this).closest(".e_color_pallet_item");

      // Get the value of the data-todoid attribute
      let clickedColorTextId = colorItem.attr("id");
      // console.log(clickedColorTextId);
      let todoEditTextInput = $(
        `.e_color_change_input[data-colorid="${clickedColorTextId}"]`
      );

      // saving when enter btn is pressed
      todoEditTextInput.keydown(function (event) {
        var keycode = event.keyCode ? event.keyCode : event.which;

        if (keycode == 13 && !event.shiftKey) {
          // Prevent default behavior if Enter is pressed without Shift
          event.preventDefault();
          let newHex = $(this).val();

          // Now save the new color pallet
          let currentPallet = returnCurrentPallet();

          let newPallet = new ColorPallet();
          newPallet.setPallet(currentPallet.colors);
          // change color
          newPallet.changeColor(newHex, clickedColorTextId);
          // newpallet master function
          addNewPalletMaster(currentPallet, newPallet);

          // Hide the input field and show the <p> tag
          colorItem.find(".e_color_pallet_item_text").hide();
          colorItem.find(".e_color_change_input").show();
        }
      });

      // Hide the <p> tag and show the <input> input field
      colorItem.find(".e_color_pallet_item_text").hide();
      colorItem.find(".e_color_change_input").css("display", "block");
      // colorItem.find(".e_color_change_input").focus();
      todoEditTextInput.select();

      $(document).on("click", function (event) {
        // Check if the click event target is not within the color item
        if (
          !colorItem.is(event.target) &&
          colorItem.has(event.target).length === 0
        ) {
          colorItem.find(".e_color_change_input").hide();
          colorItem.find(".e_color_pallet_item_text").show();
        }
      });
    }
  );
});
