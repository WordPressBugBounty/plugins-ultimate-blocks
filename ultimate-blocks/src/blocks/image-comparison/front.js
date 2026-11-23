/**
 * Image Comparison on the frontend.
 *
 * The slider position is the clip path of the before layer and the left (or
 * top) of the divider. This script moves both with drag, hover or click (the
 * block setting) and always with the keyboard on the handle.
 */
(() => {
	const clamp = (value) => Math.min(100, Math.max(0, value));

	const init = (block) => {
		const frame = block.querySelector(".ub-image-comparison__frame");
		const before = block.querySelector(".ub-image-comparison__before");
		const divider = block.querySelector(".ub-image-comparison__divider");
		const handle = block.querySelector(".ub-image-comparison__handle");

		if (!frame || !before || !divider || !handle) {
			return;
		}

		const isVertical = block.classList.contains("is-vertical");
		const moveOn = block.dataset.move ?? "drag";
		let position = Number(handle.getAttribute("aria-valuenow")) || 50;
		let isDragging = false;

		const setPosition = (value) => {
			position = clamp(Math.round(value * 10) / 10);
			const rest = 100 - position;
			before.style.clipPath = isVertical
				? `inset(0 0 ${rest}% 0)`
				: `inset(0 ${rest}% 0 0)`;
			divider.style[isVertical ? "top" : "left"] = `${position}%`;
			handle.setAttribute("aria-valuenow", Math.round(position));
			handle.setAttribute("aria-valuetext", `${Math.round(position)}%`);
		};

		const positionFromEvent = (event) => {
			const rect = frame.getBoundingClientRect();
			return isVertical
				? ((event.clientY - rect.top) / rect.height) * 100
				: ((event.clientX - rect.left) / rect.width) * 100;
		};

		//touch screens have no hover, so they drag in every mode
		const canDrag = (event) => moveOn === "drag" || event.pointerType !== "mouse";

		frame.addEventListener("pointerdown", (event) => {
			if (!canDrag(event) || event.button !== 0) {
				return;
			}
			isDragging = true;
			frame.setPointerCapture(event.pointerId);
			block.classList.add("is-dragging");
			setPosition(positionFromEvent(event));
		});

		frame.addEventListener("pointermove", (event) => {
			if (isDragging || (moveOn === "hover" && event.pointerType === "mouse")) {
				setPosition(positionFromEvent(event));
			}
		});

		const stopDrag = () => {
			isDragging = false;
			block.classList.remove("is-dragging");
		};
		frame.addEventListener("pointerup", stopDrag);
		frame.addEventListener("pointercancel", stopDrag);

		if (moveOn === "click") {
			frame.addEventListener("click", (event) => {
				if (event.pointerType === "mouse" || event.pointerType === undefined) {
					block.classList.add("is-animating");
					setPosition(positionFromEvent(event));
				}
			});
			block.addEventListener("transitionend", () => block.classList.remove("is-animating"));
		}

		handle.addEventListener("keydown", (event) => {
			const step = event.shiftKey ? 10 : 1;
			const moves = {
				ArrowLeft: -step,
				ArrowRight: step,
				ArrowUp: isVertical ? -step : step,
				ArrowDown: isVertical ? step : -step,
				PageUp: 10,
				PageDown: -10,
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

	const initAll = () => {
		document.querySelectorAll(".ub-image-comparison").forEach(init);
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initAll);
	} else {
		initAll();
	}
})();
