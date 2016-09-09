 function TiledImage(imagePath, columns, rows) {
	this.imageList = new Array();
	this.tickTime = 0;
	this.tickDrawFrameInterval = 0;
	this.tickRefreshInterval = 100;

	var image = new Image();
	image.src = imagePath;
	this.imageList.push(image);
	this.imageTileColCount = columns;
	this.imageTileRowCount = rows;
	this.imageCurrentCol = 0;
	this.imageCurrentRow = 0;
	this.imageAnimationColMin = 0;
	this.imageAnimationColMax = 0;
}

TiledImage.prototype.addImage = function(imagePath) {
	var image = new Image();
	image.src = imagePath;
	this.imageList.push(image);
};

// starts at 0
TiledImage.prototype.changeRow = function(row) {
	this.imageCurrentRow = row;
}

// starts at 0
TiledImage.prototype.changeColumnInterval = function (colMin, colMax) {
	this.imageAnimationColMin = colMin;	
	this.imageAnimationColMax = colMax;	

	if (this.imageCurrentCol < this.imageAnimationColMin || 
		this.imageCurrentCol >= this.imageAnimationColMax) {
		this.imageCurrentCol = this.imageAnimationColMin;
	}
}

TiledImage.prototype.resetCol = function () {
	this.imageCurrentCol = this.imageAnimationColMin;
}

TiledImage.prototype.tick = function (ctx, spritePosX, spritePosY) {
	var now = new Date().getTime();
	var delta = now - (this.tickTime || now);
	this.tickTime = now;
	this.tickDrawFrameInterval += delta;

	if (this.tickDrawFrameInterval > this.tickRefreshInterval) {
		this.tickDrawFrameInterval = 0;
	}

	for (var i = 0; i < this.imageList.length;i++) {

		if (this.imageList[i].complete) {
			ctx.drawImage(this.imageList[i], 
						  this.imageList[i].width/this.imageTileColCount * this.imageCurrentCol, 
						  this.imageList[i].height/this.imageTileRowCount * this.imageCurrentRow,
						  this.imageList[i].width/this.imageTileColCount, 
						  this.imageList[i].height/this.imageTileRowCount, 
						  Math.floor(spritePosX - this.imageList[i].width/this.imageTileColCount/2), 
						  Math.floor(spritePosY - this.imageList[i].height/this.imageTileRowCount/2), 
						  this.imageList[i].width/this.imageTileColCount, 
						  this.imageList[i].height/this.imageTileRowCount);


			if (this.tickDrawFrameInterval == 0) {
				this.imageCurrentCol++;

				if (this.imageCurrentCol < this.imageAnimationColMin || 
					this.imageCurrentCol >= this.imageAnimationColMax) {
					this.imageCurrentCol = this.imageAnimationColMin;
				}
			}
		}
	}
}
