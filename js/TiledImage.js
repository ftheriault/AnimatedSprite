function TiledImage(imagePath, columns, rows, refreshInterval, horizontal, scale, nodeID) {
	this.nodeID = nodeID;

	if (this.nodeID != null) {
		document.getElementById(this.nodeID).style.position = "absolute";
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

	var image = new Image();
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
}

TiledImage.prototype.setFullImageLoop = function (count, fullImageCallback = null) {
	this.fullImageCallback = fullImageCallback;
	this.imageCurrentCol = 0;
	this.imageCurrentRow = 0;
	this.fullImageIdx = 0;
	this.fullImageCount = count;
	this.stopped = false;
};

TiledImage.prototype.setFlipped = function (flipped) {
	this.flipped = flipped;
};
TiledImage.prototype.setOpacity = function (opacity) {
	if (opacity > 1) opacity = 1;
	if (opacity < 0) opacity = 0;

	this.opacity = opacity;
};


TiledImage.prototype.setLooped = function (looped) {
	this.looped = looped;
}

TiledImage.prototype.addImage = function(imagePath) {
	var image = new Image();
	image.src = imagePath;
	this.imageList.push(image);
};

// starts at 0
TiledImage.prototype.changeRow = function(row) {
	this.imageCurrentRow = row;
	this.stopped = false;

	if (!this.horizontal) {
		this.imageAnimationMin = row;
		this.imageAnimationMax = row;
	}
}

// starts at 0
TiledImage.prototype.changeCol = function(col) {
	this.imageCurrentCol = col;
	this.stopped = false;

	if (this.horizontal) {
		this.imageAnimationMin = col;
		this.imageAnimationMax = col;
	}
}

// starts at 0
TiledImage.prototype.changeMinMaxInterval = function (min, max, doneEvent = null) {
	max += 1;
	this.stopped = false;

	if (this.imageTileColCount < max) {
		max = this.imageTileColCount;
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

TiledImage.prototype.resetCol = function () {
	this.imageCurrentCol = this.imageAnimationColMin;
	this.stopped = false;
}

TiledImage.prototype.setRotationAngle = function (angle) {
	this.angle = angle;
}

TiledImage.prototype.getActualWidth = function () {
	return this.imageList[0].width/this.imageTileColCount * this.scale;
};

TiledImage.prototype.getActualHeight = function () {
	return this.imageList[0].height/this.imageTileRowCount * this.scale;
};

TiledImage.prototype.setPaused = function (paused) {
	this.stopped = paused;
};

TiledImage.prototype.tick = function (spritePosX, spritePosY, ctx) {

	if (ctx == null) {
		if (this.imageList[0].complete) {
			var canvas = document.getElementById(this.nodeID + "-canvas");
			var w = this.getActualWidth();
			var h = this.getActualHeight();

			if (canvas == null) {
				document.getElementById(this.nodeID).innerHTML = "<canvas id='" + this.nodeID + "-canvas' width='" + w + "' height='" + h + "'></canvas>";
				canvas = document.getElementById(this.nodeID + "-canvas");
			}

			document.getElementById(this.nodeID).style.left = spritePosX + "px";
			document.getElementById(this.nodeID).style.top = spritePosY + "px";

			spritePosX = w/2;
			spritePosY = h/2;

			ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, w, h);
		}
	}

	var now = new Date().getTime();
	var delta = now - (this.tickTime || now);
	this.tickTime = now;
	this.tickDrawFrameInterval += delta;

	if (this.tickDrawFrameInterval > this.tickRefreshInterval && !this.stopped) {
		this.tickDrawFrameInterval = 0;
	}

	var actualW = this.getActualWidth();
	var actualH = this.getActualHeight();

	for (var i = 0; i < this.imageList.length;i++) {
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
