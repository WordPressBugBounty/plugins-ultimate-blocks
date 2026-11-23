"use strict";

/**
 * Image Comparison on the frontend.
 *
 * The slider position is the clip path of the before layer and the left (or
 * top) of the divider. This script moves both with drag, hover or click (the
 * block setting) and always with the keyboard on the handle.
 */
(function () {
  var clamp = function clamp(value) {
    return Math.min(100, Math.max(0, value));
  };
  var init = function init(block) {
    var _block$dataset$move;
    var frame = block.querySelector(".ub-image-comparison__frame");
    var before = block.querySelector(".ub-image-comparison__before");
    var divider = block.querySelector(".ub-image-comparison__divider");
    var handle = block.querySelector(".ub-image-comparison__handle");
    if (!frame || !before || !divider || !handle) {
      return;
    }
    var isVertical = block.classList.contains("is-vertical");
    var moveOn = (_block$dataset$move = block.dataset.move) !== null && _block$dataset$move !== void 0 ? _block$dataset$move : "drag";
    var position = Number(handle.getAttribute("aria-valuenow")) || 50;
    var isDragging = false;
    var setPosition = function setPosition(value) {
      position = clamp(Math.round(value * 10) / 10);
      var rest = 100 - position;
      before.style.clipPath = isVertical ? "inset(0 0 ".concat(rest, "% 0)") : "inset(0 ".concat(rest, "% 0 0)");
      divider.style[isVertical ? "top" : "left"] = "".concat(position, "%");
      handle.setAttribute("aria-valuenow", Math.round(position));
      handle.setAttribute("aria-valuetext", "".concat(Math.round(position), "%"));
    };
    var positionFromEvent = function positionFromEvent(event) {
      var rect = frame.getBoundingClientRect();
      return isVertical ? (event.clientY - rect.top) / rect.height * 100 : (event.clientX - rect.left) / rect.width * 100;
    };

    //touch screens have no hover, so they drag in every mode
    var canDrag = function canDrag(event) {
      return moveOn === "drag" || event.pointerType !== "mouse";
    };
    frame.addEventListener("pointerdown", function (event) {
      if (!canDrag(event) || event.button !== 0) {
        return;
      }
      isDragging = true;
      frame.setPointerCapture(event.pointerId);
      block.classList.add("is-dragging");
      setPosition(positionFromEvent(event));
    });
    frame.addEventListener("pointermove", function (event) {
      if (isDragging || moveOn === "hover" && event.pointerType === "mouse") {
        setPosition(positionFromEvent(event));
      }
    });
    var stopDrag = function stopDrag() {
      isDragging = false;
      block.classList.remove("is-dragging");
    };
    frame.addEventListener("pointerup", stopDrag);
    frame.addEventListener("pointercancel", stopDrag);
    if (moveOn === "click") {
      frame.addEventListener("click", function (event) {
        if (event.pointerType === "mouse" || event.pointerType === undefined) {
          block.classList.add("is-animating");
          setPosition(positionFromEvent(event));
        }
      });
      block.addEventListener("transitionend", function () {
        return block.classList.remove("is-animating");
      });
    }
    handle.addEventListener("keydown", function (event) {
      var step = event.shiftKey ? 10 : 1;
      var moves = {
        ArrowLeft: -step,
        ArrowRight: step,
        ArrowUp: isVertical ? -step : step,
        ArrowDown: isVertical ? step : -step,
        PageUp: 10,
        PageDown: -10
      };
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        setPosition(event.key === "Home" ? 0 : 100);
      } else if (event.key in moves) {
        event.preventDefault();
        setPosition(position + moves[event.key]);
      }
    });
  };
  var initAll = function initAll() {
    document.querySelectorAll(".ub-image-comparison").forEach(init);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();