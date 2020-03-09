function createRecordableDrawing(canvasId){
    
	this.canvas = null;
	this.width = this.height = 0;
	this.mouseDown = false;
	this.currentRecordingPoint = null;
	this.recordings = [];
    this.lastMouseX = this.lastMouseY = -1;
    
    self.canvas = $("#" + canvasId);
    if (self.canvas.length == 0){
        return;
    } 
    self.canvas = self.canvas.get(0);
    self.width = $(self.canvas).width();
    self.height = $(self.canvas).height();
    self.ctx = self.canvas.getContext("2d");

    $(self.canvas).bind("mousedown", handleMouseDown);
    $(self.canvas).bind("mouseup", handleMouseUp);
    $(self.canvas).bind("mousemove", hadleMouseMove);
}

function handleMouseDown(){
    
}