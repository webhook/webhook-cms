$( document ).ready(function() {
  // Shift nav in mobile when clicking the menu.
  $(document).on('click', "[data-toggle='wy-nav-top']", function(event) {
    $("[data-toggle='wy-nav-shift']").toggleClass("shift");
  });
  // Close menu when you click a link.
  $(document).on("click", ".wy-menu-vertical .current ul li a", function(event) {
    $("[data-toggle='wy-nav-shift']").removeClass("shift");
  });
});
