// Scroll sync code based off work by @velesin on the Discourse project
// Discourse can be found here: https://github.com/discourse/discourse/

window.scrollSync = function(container) {
  var panels = {};
  panels.preview = container.$('.wh-markdown-preview')[0];
  panels.previewScroller = container.$('.wh-markdown-preview-scroller')[0];
  panels.input = container.$('.CodeMirror-scroll')[0];

  var paneContentHeight = function(pane) {
    var $pane = $(pane);
    var paneVerticalPadding = $pane.outerHeight() - $pane.height();

    return pane.scrollHeight - paneVerticalPadding;
  };

  var prevScrollPosition = $(panels.input).scrollTop();
  var caretMarkerPosition = 0;
  var markerPositions = {
    scroller: [0, paneContentHeight(panels.previewScroller)],
    preview: [0, paneContentHeight(panels.preview)]
  };

  var cacheCaretMarkerPosition = function() {
    var caret = $(panels.previewScroller).find(".caret");
    caretMarkerPosition = caret.length > 0 ? caret.position().top : 0;
  };

  var cachePaneMarkerPositions = function(cacheName, pane) {
    var $pane = $(pane);
    var paneScrollPosition = $pane.scrollTop();
    var panePaddingTop = parseInt($pane.css("padding-top"));

    markerPositions[cacheName] = [0];
    $(pane).find(".marker").each(function () {
      var markerPosition = $(this).position().top + paneScrollPosition - panePaddingTop;
      markerPositions[cacheName].push(markerPosition);
    });
    markerPositions[cacheName].push(paneContentHeight(pane));
  };

  var cacheMarkerPositions = function() {
    cachePaneMarkerPositions("scroller", panels.previewScroller);
    cachePaneMarkerPositions("preview", panels.preview);
  };

  var getMarkerPositions = function(syncPosition) {
    var startMarkerIndex = 0;
    var endMarkerIndex = markerPositions.scroller.length - 1;

    for (var index = startMarkerIndex + 1; index < endMarkerIndex; index += 1) {
      if (markerPositions.scroller[index] > syncPosition) {
        endMarkerIndex = index;
        break;
      }
      startMarkerIndex = index;
    }

    console.log(markerPositions);

    return {
      scrollerStart: markerPositions.scroller[startMarkerIndex],
      scrollerEnd: markerPositions.scroller[endMarkerIndex],
      previewStart: markerPositions.preview[startMarkerIndex],
      previewEnd: markerPositions.preview[endMarkerIndex]
    };
  };

  var detectScrollDown = function(currentPosition, previousPosition) {
    return (currentPosition - previousPosition >= 0);
  };

  var getRatio = function(positions) {
    return (positions.previewEnd - positions.previewStart) / (positions.scrollerEnd - positions.scrollerStart);
  };

  var syncScroll = function(isEdit) {
    var scrollPosition = $(panels.input).scrollTop();
    var isScrollDown = (scrollPosition - prevScrollPosition >= 0);
    prevScrollPosition = scrollPosition;

    var inputBaseline;
    var previewBaseline;
    var threshold;

    if (isEdit) {
      inputBaseline = caretMarkerPosition;
      previewBaseline = ($(panels.preview).height() * (caretMarkerPosition - scrollPosition) / $(panels.input).height());
      threshold = 20;
    } else if (isScrollDown) {
      inputBaseline = scrollPosition + $(panels.input).height();
      previewBaseline = $(panels.preview).height();
      threshold = 0;
    } else {
      inputBaseline = scrollPosition;
      previewBaseline = 0;
      threshold = 0;
    }

    var positions = getMarkerPositions(inputBaseline);
    var ratio = getRatio(positions);

    var newPreviewScrollPosition = positions.previewStart - previewBaseline + (inputBaseline - positions.scrollerStart) * ratio;

    if (threshold == 0 || Math.abs(newPreviewScrollPosition - $(panels.preview).scrollTop()) >= threshold) {
      $(panels.preview).scrollTop(newPreviewScrollPosition);
    }
  };

  var reCache = function() {
    cacheMarkerPositions();
    cacheCaretMarkerPosition();
    syncScroll(true);
  }

  return {
    sync: syncScroll,
    cache: reCache
  }
}