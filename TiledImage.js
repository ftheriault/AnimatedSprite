/*!
  * Animated Sprite
  * Copyright 2011-2022 Frédéric Thériault
  * Licensed under MIT
  */
export default class TiledImage {
	constructor (imagePath, columns, rows, refreshInterval, horizontal, scale, nodeOrId) {
		if (nodeOrId != null) {
			this.node = nodeOrId;

			if (typeof nodeOrId == "string") {
				this.node = document.getElementById(nodeOrId);
			}

			this.node.style.position = "absolute";
		}

		this.imageList = new Array();
		this.tickTime = 0;
		this.tickDrawFrameInterval = 0;
		this.tickRefreshInterval = 100;
		this.horizontal = true;
		this.scale = 1.0;
		this.flipped = false;
		this.looped = true;

		if (scale !== undefined) {
			this.scale = scale;
		}

		if (horizontal !== undefined) {
			this.horizontal = horizontal;
		}

		if (refreshInterval !== undefined) {
			this.tickRefreshInterval = refreshInterval;
		}

		let image = new Image();
		image.src = imagePath;
		this.imageList.push(image);
		this.imageTileColCount = columns;
		this.imageTileRowCount = rows;
		this.imageCurrentCol = 0;
		this.imageCurrentRow = 0;
		this.imageAnimationMin = 0;
		this.imageAnimationMax = columns;
		this.angle = 0;
		this.opacity = 1;
		this.fullImageIdx = 0;
		this.fullImageCount = null;
		this.fullImageCallback = null;
		this.stopped = true;

		this.minW = null;
		this.maxW = null;
		this.minH = null;
		this.maxH = null;
		this.actualWidth = null;
		this.actualHeight = null;
	}

	setFullImageLoop (count, fullImageCallback = null) {
		this.fullImageCallback = fullImageCallback;
		this.imageCurrentCol = 0;
		this.imageCurrentRow = 0;
		this.fullImageIdx = 0;
		this.fullImageCount = count;
		this.stopped = false;
	}

	setFlipped(flipped) {
		this.flipped = flipped;
	}

	setOpacity (opacity) {
		if (opacity > 1) opacity = 1;
		if (opacity < 0) opacity = 0;

		this.opacity = opacity;
	}

	setScale (scale) {
		this.scale = scale;
		let w = this.getActualWidth();
		let h = this.getActualHeight();

		if (this.node != null) {
			this.node.innerHTML = "<canvas width='" + w + "' height='" + h + "'></canvas>";
		}
	}

	setLooped (looped) {
		this.looped = looped;
	}

	addImage (imagePath) {
		let image = new Image();
		image.src = imagePath;
		this.imageList.push(image);
	}

	// starts at 0
	changeRow (row) {
		this.imageCurrentRow = row;
		this.stopped = false;

		if (!this.horizontal) {
			this.imageAnimationMin = row;
			this.imageAnimationMax = row;
		}
	}

	// starts at 0
	changeCol (col) {
		this.imageCurrentCol = col;
		this.stopped = false;

		if (this.horizontal) {
			this.imageAnimationMin = col;
			this.imageAnimationMax = col;
		}
	}

	// starts at 0
	changeMinMaxInterval (min, max, doneEvent = null) {
		max += 1;
		this.stopped = false;

		if (this.horizontal && this.imageTileColCount < max) {
			max = this.imageTileColCount;
		}
		else if (!this.horizontal && this.imageTileRowCount < max) {
			max = this.imageTileRowCount;
		}

		this.imageAnimationMin = min;
		this.imageAnimationMax = max;

		if (this.horizontal) {
			this.imageCurrentCol = this.imageAnimationMin;
		}
		else {
			this.imageCurrentRow = this.imageAnimationMin;
		}

		this.doneEvent = doneEvent;
	}

	resetCol() {
		this.imageCurrentCol = this.imageAnimationMin;
		this.stopped = false;
	}

	setRotationAngle (angle) {
		this.angle = angle;
	}

	updateDimensions() {
		let originalW = this.imageList[0].width/this.imageTileColCount * this.scale;

		if (originalW > 0) {
			let originalH = this.imageList[0].height/this.imageTileRowCount * this.scale;
			let w = originalW;
			let h = originalH;

			if (this.minW != null && w < this.minW) {
				w = this.minW;
				h = w/originalW * originalH;
			}
			if (this.maxW != null && w > this.maxW) {
				w = this.maxW;
				h = w/originalW * originalH;
			}

			if (this.minH != null && h < this.minH) {
				h = this.minH;
				w = h/originalH * originalW;
			}
			if (this.maxH != null && h > this.maxH) {
				h = this.maxH;
				w = h/originalH * originalW;
			}

			this.actualWidth = w;
			this.actualHeight = h;
		}
	}

	getActualWidth () {
		if (this.actualWidth == null || this.actualWidth == 0) {
			this.updateDimensions();
		}

		return this.actualWidth;
	}

	getActualHeight () {
		if (this.actualHeight == null || this.actualHeight == 0) {
			this.updateDimensions();
		}

		return this.actualHeight;
	}

	setPaused (paused) {
		this.stopped = paused;
	}

	setMinMaxDimensions(minW, minH, maxW, maxH) {
		this.minW = minW;
		this.minH = minH;
		this.maxW = maxW;
		this.maxH = maxH;
		this.actualWidth = null;
		this.actualHeight = null;
	}

	tick (spritePosX, spritePosY, ctx) {
		if (ctx == null) {
			if (this.imageList[0].complete) {
				let canvas = this.node.querySelector("canvas");
				let w = this.getActualWidth();
				let h = this.getActualHeight();

				if (canvas == null) {
					this.node.innerHTML = "<canvas width='" + w + "' height='" + h + "'></canvas>";
					canvas = this.node.querySelector("canvas");
				}

				this.node.style.left = spritePosX - (w/2) + "px";
				this.node.style.top = spritePosY - (w/2) + "px";

				spritePosX = w/2;
				spritePosY = h/2;

				ctx = canvas.getContext("2d");
				ctx.clearRect(0, 0, w, h);
			}
		}

		let now = new Date().getTime();
		let delta = now - (this.tickTime || now);
		this.tickTime = now;
		this.tickDrawFrameInterval += delta;

		if (this.tickDrawFrameInterval > this.tickRefreshInterval && !this.stopped) {
			this.tickDrawFrameInterval = 0;
		}

		let actualW = this.getActualWidth();
		let actualH = this.getActualHeight();

		for (let i = 0; i < this.imageList.length;i++) {
			if (this.imageList[i].complete && ctx != null) {
				let x = Math.floor(spritePosX - actualW/2);
				let y = Math.floor(spritePosY - actualH/2);

				if (this.flipped || this.angle != 0 || this.opacity != 1) {
					ctx.save();
				}

				if (this.flipped) {
					ctx.translate(Math.floor(spritePosX - actualW/2) + actualW,
								Math.floor(spritePosY - actualH/2));
					ctx.scale(-1, 1);
					x = 0;
					y = 0;
				}

				if (this.angle != 0) {
					ctx.translate(Math.floor(spritePosX),
								Math.floor(spritePosY));
					ctx.rotate((this.flipped ? -1 : 1) * this.angle * Math.PI/ 180);

					x = -actualW/2;
					y = -actualH/2;
				}

				if (this.opacity != 1) ctx.globalAlpha   = this.opacity;

				ctx.drawImage(this.imageList[i],
							this.imageList[i].width/this.imageTileColCount * this.imageCurrentCol,
							this.imageList[i].height/this.imageTileRowCount * this.imageCurrentRow,
							this.imageList[i].width/this.imageTileColCount,
							this.imageList[i].height/this.imageTileRowCount,
							x,
							y,
							actualW,
							actualH);

				if (this.flipped || this.angle != 0 || this.opacity != 1) {
					ctx.restore();
				}

			}
		}

		if (this.tickDrawFrameInterval == 0) {
			if (this.horizontal) {
				if (this.fullImageCount != null) {
					this.fullImageIdx += 1;

					if (this.fullImageIdx == this.fullImageCount) {
						this.fullImageIdx = 0;
						this.imageCurrentCol = -1;
						this.imageCurrentRow = 0;

						if (this.fullImageCallback != null) {
							this.fullImageCallback();
						}
					}
					else {
						if (this.imageCurrentCol + 1 >= this.imageTileColCount) {
							this.imageCurrentCol = -1;
							this.imageCurrentRow++;
						}
					}
				}

				if ((this.fullImageCount == null && this.imageCurrentCol + 1 >= this.imageAnimationMax) ||
					(this.fullImageCount != null && this.imageCurrentCol + 1 >= this.imageTileColCount)) {
					if (this.doneEvent != null) {
						let doneEvent = this.doneEvent;
						this.doneEvent = null;
						doneEvent();
					}
					else if (this.looped) {
						this.imageCurrentCol = this.imageAnimationMin;
					}
				}
				else {
					this.imageCurrentCol++;
				}
			}
			else {
				if (this.fullImageCount != null) {
					this.fullImageIdx += 1;

					if (this.fullImageIdx == this.fullImageCount) {
						this.fullImageIdx = 0;
						this.imageCurrentCol = 0;
						this.imageCurrentRow = -1;

						if (this.fullImageCallback != null) {
							this.fullImageCallback();
						}
					}
					else {
						if (this.imageCurrentRow + 1 >= this.imageTileRowCount) {
							this.imageCurrentRow = -1;
							this.imageCurrentCol++;
						}
					}
				}

				if ((this.fullImageCount == null && this.imageCurrentRow + 1 >= this.imageAnimationMax) ||
					(this.fullImageCount != null && this.imageCurrentRow + 1 >= this.imageTileRowCount)){
					if (this.doneEvent != null) {
						let doneEvent = this.doneEvent;
						this.doneEvent = null;
						doneEvent();
					}
					else if (this.looped) {
						this.imageCurrentRow = this.imageAnimationMin;
					}
				}
				else {
					this.imageCurrentRow++;
				}
			}
		}
	}
}
