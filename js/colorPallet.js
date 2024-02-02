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

const generateFirstFiveColors = () => {
    let genColors = []
    for (let index = 0; index < 5; index++) {
        let newColor = {
            id: createId(),
            color: `#${generateRandomColor()}`
        }
        genColors.push(newColor)

    }
    return genColors

}
const renderColorPallet = () => {
    $(".e_color_pallet_cont").empty()
    colorData.map((color, index) => {
        $(".e_color_pallet_cont").append(createColorPalletItem(color, index, colorData.length))
    })
}

$(() => {
    // loadColorPallet
    colorData = generateFirstFiveColors()
    // render on load
    renderColorPallet()

    $(document).on('keydown', function (event) {
        if (event.key === " ") {
            // event.preventDefault();
            // need to make a way where the key down only is recognized on the color pallet tab
            // clear array
            colorData = []
            console.log(colorData)
            let newColors = generateFirstFiveColors()
            console.log(newColors)
            colorData = newColors
            // re render ui
            renderColorPallet()
        }
    });


})