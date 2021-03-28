function getMousePos(canvas, evt) {
}

class Square {
    constructor(size, x, y) {
        this.size = size;
        this.x = x; // absolute x
        this.y = y; // absolute y
    }

    draw(ctx, offset, zoom) {
        const w = this.size * zoom;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.fillRect(this.x + offset.x, this.y + offset.y, w, w);
        ctx.stroke();
    }
}

class Canvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.height = 500;
        this.canvas.width = 500;
        this.context = canvas.getContext('2d');

        this.square = new Square(400, 0, 0);

        this.mouse = {
            x: 0,
            y: 0
        };

        this.offset = {
            x: 0,
            y: 0
        };

        this.globalDrag = {
            x0: 0,
            y0: 0,
            dx: 0,
            dy: 0,
            offsetX0: 0,
            offsetY0: 0,
            dragging: false
        };

        this.objects = [];

        this.zoom = 1;
        
        this.ui = {
            x: $("#ui-x"),
            y: $("#ui-y"),
            xOffset: $("#ui-x-offset"),
            yOffset: $("#ui-y-offset"),
            inspector: $("#ui-inspector")
        }
        
        self = this; // to make sure 'this' isn't stolen by scope...?

        this.canvas.addEventListener("mousemove", this.updateMousePos);
        this.canvas.addEventListener("mousedown", this.handleDown);
        this.canvas.addEventListener("mouseup", this.handleUp);
    }

    update() {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        self.ui.xOffset.html(self.offset.x);
        self.ui.yOffset.html(self.offset.y);
        this.square.draw(canvas.context, this.offset, this.zoom);
    }

    handleDown(e) {
        if (self.globalDrag.dragging) {
            // is dragging...?
            var rect = self.canvas.getBoundingClientRect();
            currX = e.clientX - rect.left;
            currY = e.clientY - rect.top;
            self.globalDrag.dx = self.globalDrag.x0 - currX;
            self.globalDrag.dy = self.globalDrag.y0 - currY;

            self.offset.x = self.globalDrag.offsetX0 += self.globalDrag.dx;
            self.offset.y = self.globalDrag.offsetY0 += self.globalDrag.dx;
        } else {
            console.log("drag start");
            // init global drag
            self.globalDrag.dragging = true;
            self.globalDrag.x0 = self.mouse.x;
            self.globalDrag.y0 = self.mouse.y;
        }
    }

    handleUp(e) {
        if (self.globalDrag.dragging) {
            console.log("drag end");
            console.log(self.globalDrag);
            self.globalDrag.dragging = false;
            self.offset.x += self.globalDrag.dx;
            self.offset.y += self.globalDrag.dy;
        }
    }

    updateMousePos(e) {
        var rect = self.canvas.getBoundingClientRect();
        self.mouse.x = e.clientX - rect.left;
        self.mouse.y = e.clientY - rect.top;
        self.ui.x.html(self.mouse.x);
        self.ui.y.html(self.mouse.y);
    }
}

// kick off main loop

const canvas = new Canvas(document.getElementById('canvas-main'));

// ideally move into canvas object...
function update() {
    window.requestAnimationFrame(update);
    canvas.update();
}

update();