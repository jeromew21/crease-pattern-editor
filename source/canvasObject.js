class CanvasObject {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.locked = false;
        this.name_ = "<abstract canvas object>"
    }

    name() {
        return this.name_;
    }

    /* Return a list of lines for snapping */
    lines() {
        return [];
    }

    update() { }

    xRel() {
        return (this.x + this.canvas.offset.x) * this.canvas.zoom;
    }

    yRel() {
        return (this.y + this.canvas.offset.y) * this.canvas.zoom;
    }

    get coords() {
        return { x: this.x, y: this.y };
    }

    isPointInside(coords) { }

    draw() { }
}

class Paper extends CanvasObject {
    static bg = '#f1f2f6';
    static outline = '#000000';

    constructor(width, height, canvas) {
        super(0, 0, canvas);
        this.width = width;
        this.height = height;
        this.name_ = "paper";
        this.showDiagonals = true;
    }

    rectBounds() {
        return {
            x: this.xRel(),
            y: this.yRel(),
            w: this.width * this.canvas.zoom,
            h: this.height * this.canvas.zoom
        }
    }

    isPointInside(coords) {
        return inBounds(coords, this.rectBounds());
    }

    draw() {
        var ctx = this.canvas.ctx;
        var w = this.width * this.canvas.zoom;
        var h = this.height * this.canvas.zoom;
        ctx.fillStyle = Paper.bg;
        ctx.strokeStyle = Paper.outline;
        ctx.beginPath();
        ctx.fillRect(this.xRel(), this.yRel(), w, h);
        ctx.stroke();
        ctx.lineWidth = 0.5;
        ctx.strokeRect(this.xRel(), this.yRel(), w, h);

        if (this.showDiagonals) {
            w = this.width;
            h = this.height;
            var ox = this.canvas.offset.x;
            var oy = this.canvas.offset.y;
            var z = this.canvas.zoom;
            var arr = [
                [ox * z, oy * z],
                [(w + ox) * z, (h + oy) * z],
                [(w + ox) * z, oy * z],
                [ox * z, (h + oy) * z]
            ]
            ctx.beginPath();
            ctx.moveTo(...arr[0]);
            ctx.lineTo(...arr[1]);
            ctx.moveTo(...arr[2]);
            ctx.lineTo(...arr[3]);
            ctx.stroke();
        }
    }
}

class Circle extends CanvasObject {
    static circleCount = 0;
    static pink = "#ff4757";
    static black = "#000000"

    constructor(x, y, r, canvas) {
        super(x, y, canvas);
        this.radius = r;
        this.name_ = "circle" + Circle.circleCount;
        this.color = Circle.black
        this.isSelected = false;
        Circle.circleCount += 1;
    }

    name() {
        return this.name_;
    }

    // sets the state of an object
    update() {
        for (var i = 0; i < this.parent.objects.length; i++) {
            var obj = this.parent.objects[i];
            if (obj instanceof Circle && obj != this) {
                if (dist(this.coords, obj.coords) < this.radius + obj.radius) {
                    this.color = Circle.pink;
                    return;
                }
            }
        }
        this.color = Circle.black;
    }

    isPointInside(coords, offset, zoom) {
        var dx = coords.x - this.xRel(offset, zoom);
        var dy = coords.y - this.yRel(offset, zoom);

        return Math.sqrt(dx * dx + dy * dy) < this.radius * zoom;
    }

    draw() {
        if (this.isSelected) {
            ctx.lineWidth = 2;
        } else {
            ctx.lineWidth = 1;
        }
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;

        var r = this.radius * this.canvas.zoom;
        if (this.canvas.circles.show) {
            ctx.beginPath();
            ctx.arc(this.xRel(), this.yRel(), r, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(this.xRel(), this.yRel(), 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}
