class CanvasObject {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.x0 = x;
        this.y0 = y;
        this.alive = true;
        this.canvas = canvas;
        this.locked = false;
        this.name_ = "<abstract canvas object>"
        this.isSelected = false;
        this.selectable = true;
    }

    name() {
        return this.name_;
    }

    copy() {
        return {};
    }

    /* Return a list of lines for snapping */
    lines() {
        return [];
    }


    xRel() {
        return this.canvas.renderX(this.x);
    }

    yRel() {
        return this.canvas.renderY(this.y);
    }

    get coords() {
        return { x: this.x, y: this.y };
    }

    isPointInside(coords) { }

    delete() {
        this.alive = false;
        this.isSelected = false;
    }

    getType() {
        return "CanvasObject";
    }

    draw() { }
}

class Paper extends CanvasObject {
    static bg = '#f1f2f6';
    static outline = '#a4b0be';

    constructor(width, height, canvas) {
        super(0, 0, canvas);
        this.width = width;
        this.height = height;
        this.name_ = "paper";
        this.showDiagonals = true;
        this.show = true;
        this.selectable = false;
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

    getType() { return "Paper"; }

    draw() {
        if (!this.show) {
            return;
        }
        
        var ctx = this.canvas.ctx;
        var w = this.width * this.canvas.zoom;
        var h = this.height * this.canvas.zoom;
        ctx.fillStyle = Paper.bg;
        ctx.strokeStyle = Paper.outline;
        ctx.beginPath();
        ctx.fillRect(this.xRel(), this.yRel(), w, h);
        ctx.stroke();
        ctx.lineWidth = penSize.line;
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
    static black = "#000000";
    static blue = "#3742fa";

    constructor(x, y, r, canvas) {
        super(x, y, canvas);
        this.radius = r;
        this.name_ = "circle" + Circle.circleCount;
        this.color = Circle.black
        Circle.circleCount += 1;
    }

    getType() { return "Circle"; }

    name() {
        return this.name_;
    }

    copy() {
        return new Circle(this.x, this.y, this.radius, this.canvas);
    }

    isPointInside(coords,) {
        var dx = coords.x - this.xRel();
        var dy = coords.y - this.yRel();

        return Math.sqrt(dx * dx + dy * dy) < this.radius * this.canvas.zoom;
    }

    draw() {
        var ctx = this.canvas.context;
        this.color = Circle.black;
        for (var i = 0; i < this.canvas.objects.length; i++) {
            var obj = this.canvas.objects[i];
            if (obj instanceof Circle && obj != this && obj.alive) {
                var d = dist(this.coords, obj.coords);
                var touchDist = this.radius + obj.radius;
                if (d < touchDist) {
                    this.color = Circle.pink;
                } else if (fuzzyEquals(d, touchDist)) {
                    ctx.lineWidth = penSize.line;
                    ctx.strokeStyle = Circle.blue;
                    ctx.beginPath();
                    ctx.moveTo(this.xRel(), this.yRel());
                    ctx.lineTo(obj.xRel(), obj.yRel());
                    ctx.stroke();
                }
            }
        }

        var dotRad = 1;
        if (this.isSelected) {
            ctx.lineWidth = penSize.line * 3;
            dotRad = 2;
        } else {
            ctx.lineWidth = penSize.line;
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
        ctx.arc(this.xRel(), this.yRel(), dotRad, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

class Line extends CanvasObject {
    constructor(c1, c2, infinite, visible) {
        super(c1.x, c1.y);
        this.c1 = c1;
        this.c2 = c2;
        this.infinite = infinite;
        this.visible = visible;
    }

    name() { return "<line>"; }

    isPointInside(coords, offset, zoom) {
        return false;
    }

    getType() { return "Line"; }

    draw(ctx, offset, zoom) {
        if (!this.visible) { return; }
        var x0 = this.xRel(offset, zoom);
        var y0 = this.yRel(offset, zoom);
        var theta = Math.atan(this.slope);
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 1;
        if (this.infinite && false) {
            // var L = 10000;
            // var x1 = (this.x + L * Math.cos(theta) + offset.x)*zoom;
            // var y1 = (this.y + L * Math.sin(theta) + offset.y)*zoom;
            // var x2 = (this.x - L * Math.cos(theta) + offset.x)*zoom;
            // var y2 = (this.y - L * Math.sin(theta) + offset.y)*zoom;
            // ctx.beginPath();
            // ctx.moveTo(x0, y0);
            // ctx.lineTo(x1, y1);
            // ctx.moveTo(x0, y0);
            // ctx.lineTo(x2, y2);
            // ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(zoom * (this.c2.x + offset.x), zoom * (this.c2.y + offset.y));
            ctx.stroke();
        }
    }
}

class Tile extends CanvasObject {

}

class Triangle extends Tile {
    static count = 0;
    static black = '#000000';

    constructor(x, y, theta, l1, l2, rotation, canvas) {
        super(x, y, canvas);
        // SAS (side-angle-side)
        this.theta = theta; // in degrees
        this.l1 = l1;
        this.l2 = l2;
        this.rotation = rotation;
        this.name_ = "triangle" + Triangle.count;
        Triangle.count += 1;
        this.isSelected = false;
    }

    copy() {
        return new Triangle(this.x, this.y, this.theta, this.l1, this.l2, this.rotation, this.canvas);
    }

    getType() { return "Triangle"; }

    lines() {
        var pts = this.pointsAbs();
        var c1 = pts.c1;
        var c2 = pts.c2;
        var c3 = pts.c3;
        return [
            new Line(c1, c2, false, true),
            new Line(c2, c3, false, true),
            new Line(c3, c1, false, true)
        ];
    }


    draw() {
        var ctx = this.canvas.context;
        var zoom = this.canvas.zoom;
        var offset = this.canvas.offset;

        var pts = this.points(offset, zoom);
        var c1 = pts.c1;
        var c2 = pts.c2;
        var c3 = pts.c3;
        var incenter = pts.incenter;

        ctx.strokeStyle = Triangle.black;
        ctx.fillStyle = Triangle.black; 

        if (this.isSelected) {
            ctx.lineWidth = penSize.line * 3;
        } else {
            ctx.lineWidth = penSize.line;
        }

        

        ctx.strokeStyle = "#7bed9f";
        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(incenter.x, incenter.y);
        ctx.moveTo(c2.x, c2.y);
        ctx.lineTo(incenter.x, incenter.y);
        ctx.moveTo(c3.x, c3.y);
        ctx.lineTo(incenter.x, incenter.y);
        ctx.stroke();

        ctx.strokeStyle = "#ffa502";
        var p1 = axiom4({ c1: c1, c2: c2 }, incenter);
        ctx.beginPath();
        ctx.moveTo(incenter.x, incenter.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        
        var p2 = axiom4({ c1: c1, c2: c3 }, incenter);
        ctx.beginPath();
        ctx.moveTo(incenter.x, incenter.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.lineWidth = ctx.lineWidth * 2; 
        var p3 = axiom4({ c1: c2, c2: c3 }, incenter);
        ctx.beginPath();
        ctx.moveTo(incenter.x, incenter.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.stroke();
        ctx.lineWidth = ctx.lineWidth / 2; 
        
        ctx.strokeStyle = Triangle.black;
        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.lineTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.stroke();

        if (this.canvas.circles.show) {
            ctx.strokeStyle = "#000000";
            ctx.beginPath();
            ctx.arc(c1.x, c1.y, dist(c1, p1), 0, 2 * Math.PI);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(c2.x, c2.y, dist(c2, p1), 0, 2 * Math.PI);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(c3.x, c3.y, dist(c3, p2), 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    pointsAbs() {
        var rLength1 = this.l1;
        var rLength2 = this.l2;

        var c1 = {
            x: this.x,
            y: this.y
        }

        var c2 = {
            x: c1.x + rLength1,
            y: c1.y
        }

        var rad = degToRad(this.theta);

        var c3 = {
            x: c1.x + rLength2 * Math.cos(rad),
            y: c1.y + rLength2 * Math.sin(rad),
        }

        // apply rotation around c1
        c2 = rotate(c2, c1, this.rotation);
        c3 = rotate(c3, c1, this.rotation);

        return {
            c1: c1,
            c2: c2,
            c3: c3
        };
    }

    points() {
        var zoom = this.canvas.zoom;
        var offset = this.canvas.offset;

        var rLength1 = this.l1 * zoom;
        var rLength2 = this.l2 * zoom;

        var c1 = {
            x: this.xRel(),
            y: this.yRel()
        }

        var c2 = {
            x: c1.x + rLength1,
            y: c1.y
        }

        var rad = degToRad(this.theta);

        var c3 = {
            x: c1.x + rLength2 * Math.cos(rad),
            y: c1.y + rLength2 * Math.sin(rad),
        }

        var s1 = dist(c2, c3);
        var s2 = dist(c1, c3);
        var s3 = dist(c1, c2);
        var sum = s1 + s2 + s3;
        var incenter = {
            x: (c1.x * s1 + c2.x * s2 + c3.x * s3) / sum,
            y: (c1.y * s1 + c2.y * s2 + c3.y * s3) / sum,
        }

        // apply rotation around c1
        c2 = rotate(c2, c1, this.rotation);
        c3 = rotate(c3, c1, this.rotation);
        incenter = rotate(incenter, c1, this.rotation);

        return {
            c1: c1,
            c2: c2,
            c3: c3,
            incenter: incenter,
        };
    }

    isPointInside(coords) {
        var zoom = this.canvas.zoom;
        var offset = this.canvas.offset;

        var pts = this.points(offset, zoom);
        var c1 = pts.c1;
        var c2 = pts.c2;
        var c3 = pts.c3;

        return inBoundsTriangle(coords, c1, c2, c3);
    }
}

function allSameType(objList) {
    var typ = objList[0].getType();
    for (var i = 0; i < objList.length; i++) {
        if (objList[i].getType() != typ) {
            return false;
        }
    }
    return true;
}
