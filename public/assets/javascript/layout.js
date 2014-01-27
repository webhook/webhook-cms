$( document ).ready(function() {
  // Shift nav in mobile when clicking the menu.
  $(document).on('click', "[data-toggle='wy-nav-top']", function(event) {
    $("[data-toggle='wy-nav-shift']").toggleClass("shift");
  });
  // Close menu when you click a link
  $(document).on("click", ".wy-menu-vertical a", function(event) {
    $("[data-toggle='wy-nav-shift']").removeClass("shift");
  });

  // Close menu when you click a link
  $(document).on("click", ".wy-dropdown .btn", function(event) {
    $(this).parent().find(".wy-dropdown-menu").toggle();
  });

  // Fake form builder stuffs
  $(document).on("click", "[fake-toggle*='fake-widget']", function(event) {
    var attr = $(this).attr('fake-toggle');
    var widget = attr.substring(12,attr.length);
    $("[fake-toggle='fake-widget-edit']").show();
    $("[fake-toggle='fake-widget-list']").hide();

    $("[fake-toggle*='fake-widget-form']").hide();
    $("[fake-toggle='fake-widget-form-" + widget + "']").show();
    $("[fake-toggle*='fake-widget']").removeClass("wy-control-group-edit");
    $(this).addClass("wy-control-group-edit");

  });

  $(document).on("click", "[fake-toggle='fake-widget-done']", function(event) {
    $("[fake-toggle='fake-widget-edit']").hide();
    $("[fake-toggle='fake-widget-list']").show();
    $("[fake-toggle*='fake-widget']").removeClass("wy-control-group-edit");
  });

  // I think this can be removed and we can use the tab plugin
  // this is a quick fix to get the fingers limber
  // The opacity stuff should be in the class css
  $(document).on('click', "[data-menu]", function(event) {

    var target = $(this).data('menu');
    $("[data-menu-wrap]").removeClass().addClass("move-right").css({opacity:0});
    if (target === 'all-content') {
      $("[data-menu-wrap='" + target + "']").removeClass().addClass("move-center").css({opacity:1});
    } else {
      $("[data-menu-wrap='all-content']").removeClass().addClass('move-left').css({opacity:0});
      $("[data-menu-wrap='" + target + "']").removeClass().css({opacity:1});
    }

  });

  $("[data-spy=affix]").on('affix', function (event, affix) {
    if (!affix) {
      $(this).css({
        overflow: 'hidden',
        height: Math.max.apply(null, $(this).children().map(function () { return $(this).height(); }).get())
      });
    } else {
      $(this).css({
        overflow: 'visible',
        height: 'auto'
      });
    }
  });

});


