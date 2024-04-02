const minified_css_input = $("#minified_css_input")
const minified_css_output = $("#minified_css_output")
const clear_minify_css_output_btn = $("#clear_minify_css_output_btn")

$(() => {

    minified_css_input.on("keyup change", function(e) {
        // Assuming minifyCSS is a function available that takes a string and returns a minified CSS string
        const minifiedContent = minifyCSS($(e.target).val());
        minified_css_output.val(minifiedContent);
    });


    // copy hex codes
    minified_css_output.on("click", (e) => {
    if (minified_css_output.val() === "") {
      sendNotification("fast", 3000, "Please add CSS before copying.");
      return;
    } else {
      copyFunction(minified_css_output);
    }
  });
})