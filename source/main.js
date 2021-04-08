class CanvasObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.locked = false;
    }

    name() { }

    lines() {
        return [];
    }

    update() { }

    xRel(offset, zoom) {
        return (this.x + offset.x) * zoom;
    }

    yRel(offset, zoom) {
        return (this.y + offset.y) * zoom;
    }

    get coords() {
        return { x: this.x, y: this.y };
    }

    isPointInside(coords, offset, zoom) { }
    draw(ctx, offset, zoom) { }
}

class Square extends CanvasObject {
    constructor(size, x, y) {
        super(x, y);
        this.size = size;
    }

    name() {
        return "square";
    }

    lines() {
        var res = [];
        res.push(
            new Line({ x: 0, y: 0 }, { x: 0, y: this.size }, true, true),
            new Line({ x: 0, y: 0 }, { x: this.size, y: 0 }, true, true),
            new Line({ x: this.size, y: 0 }, { x: this.size, y: this.size }, true, true),
            new Line({ x: 0, y: this.size }, { x: this.size, y: this.size }, true, true),
        );
        return res;
    }

    // return a rectangle of bounds relative to the object
    rectBounds(offset, zoom) {
        return {
            x: this.xRel(offset, zoom),
            y: this.yRel(offset, zoom),
            w: this.size * zoom,
            h: this.size * zoom
        }
    }

    isPointInside(coords, offset, zoom) {
        return inBounds(coords, this.rectBounds(offset, zoom));
    }

    draw(ctx, offset, zoom) {
        const w = this.size * zoom;
        ctx.fillStyle = '#f1f2f6';
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.fillRect(this.xRel(offset, zoom), this.yRel(offset, zoom), w, w);
        ctx.stroke();
        ctx.lineWidth = 0.5;
        ctx.strokeRect(this.xRel(offset, zoom), this.yRel(offset, zoom), w, w);
    }
}

class Triangle extends CanvasObject {
    static count = 0;
    constructor(x, y, theta, l1, l2, rotation) {
        super(x, y);
        // SAS (side-angle-side)
        this.theta = theta; // in degrees
        this.length1 = l1;
        this.length2 = l2;
        this.rotation = rotation;
        this.name_ = "triangle" + Triangle.count;
        Triangle.count += 1;
        this.isSelected = false;
    }

    name() {
        return this.name_;
    }

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

    update() {

    }

    draw(ctx, offset, zoom) {
        var pts = this.points(offset, zoom);
        var c1 = pts.c1;
        var c2 = pts.c2;
        var c3 = pts.c3;
        var incenter = pts.incenter;

        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#000000"

        if (this.isSelected) {
            ctx.lineWidth = 2;
        } else {
            ctx.lineWidth = 1;
        }

        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.lineTo(c1.x, c1.y);
        ctx.stroke();

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
        ctx.beginPath();
        var p1 = axiom4({ c1: c1, c2: c2 }, incenter);
        ctx.moveTo(incenter.x, incenter.y);
        ctx.lineTo(p1.x, p1.y);
        var p2 = axiom4({ c1: c1, c2: c3 }, incenter);
        ctx.moveTo(incenter.x, incenter.y);
        ctx.lineTo(p2.x, p2.y);
        var p3 = axiom4({ c1: c2, c2: c3 }, incenter);
        ctx.moveTo(incenter.x, incenter.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.stroke();

        // draw pivot vertex
        ctx.beginPath();
        ctx.arc(c1.x, c1.y, 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.arc(c1.x, c1.y, dist(c1, p1), 0, 2*Math.PI);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(c2.x, c2.y, dist(c2, p1), 0, 2*Math.PI);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(c3.x, c3.y, dist(c3, p2), 0, 2*Math.PI);
        ctx.stroke();
    }

    pointsAbs() {
        var rLength1 = this.length1;
        var rLength2 = this.length2;

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

    points(offset, zoom) {
        var rLength1 = this.length1 * zoom;
        var rLength2 = this.length2 * zoom;

        var c1 = {
            x: this.xRel(offset, zoom),
            y: this.yRel(offset, zoom)
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

    isPointInside(coords, offset, zoom) {
        var pts = this.points(offset, zoom);
        var c1 = pts.c1;
        var c2 = pts.c2;
        var c3 = pts.c3;

        return inBoundsTriangle(coords, c1, c2, c3);
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

class Circle extends CanvasObject {
    static circleCount = 0;
    static pink = "#ff4757";
    static black = "#000000"

    constructor(x, y, r, parent) {
        super(x, y);
        this.radius = r;
        this.parent = parent;
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

    draw(ctx, offset, zoom) {
        if (this.isSelected) {
            ctx.lineWidth = 2;
        } else {
            ctx.lineWidth = 1;
        }
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;

        var r = this.radius * zoom;
        ctx.beginPath();
        ctx.arc(this.xRel(offset, zoom), this.yRel(offset, zoom), r, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.xRel(offset, zoom), this.yRel(offset, zoom), 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

class Canvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.height = 800;
        this.canvas.width = 900;
        this.context = canvas.getContext('2d');
        this.context.strokeStyle = "#000000"

        // this.context.mozImageSmoothingEnabled = false;
        this.context.ImageSmoothingEnabled = false;

        this.square = new Square(500, 0, 0);

        this.mouse = {
            x: 0,
            y: 0
        };

        this.offset = {
            x: 50,
            y: 50
        };

        this.globalDrag = {
            x0: 0,
            y0: 0,
            offsetX0: 0,
            offsetY0: 0,
            dragging: false
        };

        this.objectDrag = {
            x0: 0,
            y0: 0,
            objX0: 0,
            objY0: 0,
            dragging: false
        }

        this.objects = [this.square];

        this.squareLines = this.square.lines();

        this.diagonalLines = [
            new Line({ x: 0, y: 0 }, { x: this.square.size, y: this.square.size }, false, true),
            new Line({ x: 0, y: this.square.size }, { x: this.square.size, y: 0 }, false, true),
        ];

        this.gridLines = [];

        this.zoom = 1;

        this.grid = {
            enabled: false,
            count: 8,
        }

        this.snap = {
            intersections: false,
        }

        this.diagonals = true;

        this.ui = {
            x: $("#ui-x"),
            y: $("#ui-y"),
            xOffset: $("#ui-x-offset"),
            yOffset: $("#ui-y-offset"),
            grid: {
                checkbox: $("#ui-grid"),
                count: $("#ui-grid-count")
            },
            diagonals: $("#ui-diagonals"),
            recenter: $("#ui-recenter"),
            circle: {
                new: $("#ui-new-circle")
            },
            tile: {
                new: $("#ui-new-tile"),
                selection: $("#ui-tile-select"),
            },
            inspector: {
                window: $("#ui-inspector"),
                name: $("#ui-inspector-name"),
                x: $("#ui-inspector-x"),
                y: $("#ui-inspector-y"),
                xMul: $("#ui-inspector-x-mul"),
                yMul: $("#ui-inspector-y-mul"),
                radiusMul: $("#ui-inspector-radius-mul"),
                radius: $("#ui-inspector-radius"),
                theta1: {
                    input: $("#ui-inspector-theta-1"),
                },
                length1: {
                    input: $("#ui-inspector-length-1"),
                    mul: $("#ui-inspector-length-mul-1")
                },
                length2: {
                    input: $("#ui-inspector-length-2"),
                    mul: $("#ui-inspector-length-mul-2")
                },
                rotation: {
                    input: $("#ui-inspector-rotation"),
                }
            },
            zoom: {
                slider: $("#ui-zoom"),
                value: $("#ui-zoom-value")
            },
            snap: {
                intersections: $("#ui-snap-intersections"),
            }
        };

        this.selectedObject = null;

        this.ui.inspector.window.hide();

        $("html").css("cursor", "default");

        var self = this; // to make sure 'this' isn't stolen by scope

        var handleMove = function (e) {
            var rect = self.canvas.getBoundingClientRect();
            self.mouse.x = e.clientX - rect.left;
            self.mouse.y = e.clientY - rect.top;
            self.ui.x.html(self.mouse.x);
            self.ui.y.html(self.mouse.y);

            if (self.objectDrag.dragging) {
                var dx = dragRatio * (self.objectDrag.x0 - self.mouse.x);
                var dy = dragRatio * (self.objectDrag.y0 - self.mouse.y);

                self.selectedObject.x = self.objectDrag.objX0 - dx;
                self.selectedObject.y = self.objectDrag.objY0 - dy;

                self.updateObjects();
                self.syncInspector();
            } if (self.globalDrag.dragging) {
                // is dragging...?
                var dx = (2 - self.zoom) * dragRatio * (self.globalDrag.x0 - self.mouse.x);
                var dy = (2 - self.zoom) * dragRatio * (self.globalDrag.y0 - self.mouse.y);

                self.offset.x = self.globalDrag.offsetX0 - dx;
                self.offset.y = self.globalDrag.offsetY0 - dy;
            } else {
                // set cursor depending on object underneath
                if (self.getObjectUnderneath(self.mouse) == null) {
                    $("html").css("cursor", "pointer");
                } else {
                    $("html").css("cursor", "default");
                }
            }
        }

        var handleLeave = function (e) {
            self.globalDragStop();
            $("html").css("cursor", "default");
        }

        var handleDown = function (e) {
            var obj = self.getObjectUnderneath(self.mouse);
            if (obj != null) {
                if (!(obj instanceof Square)) {
                    self.selectObject(obj);
                    self.objectDrag.objX0 = obj.x;
                    self.objectDrag.objY0 = obj.y;
                    self.objectDrag.x0 = self.mouse.x;
                    self.objectDrag.y0 = self.mouse.y;
                    self.objectDrag.dragging = true;
                } else {
                    // deselect
                    self.selectObject(null);
                    self.syncInspector();
                }
            } else if (!self.globalDrag.dragging) {
                // init global drag
                self.globalDrag.dragging = true;
                self.globalDrag.x0 = self.mouse.x;
                self.globalDrag.y0 = self.mouse.y;
                self.globalDrag.offsetX0 = self.offset.x;
                self.globalDrag.offsetY0 = self.offset.y;
                $("html").css("cursor", "move");
            }
        }

        var handleUp = function (e) {
            self.globalDragStop();
        }

        this.canvas.addEventListener("mousemove", handleMove);
        this.canvas.addEventListener("mousedown", handleDown);
        this.canvas.addEventListener("mouseup", handleUp);
        this.canvas.addEventListener("mouseleave", handleLeave);

        this.ui.circle.new.click(function () {
            self.createCircle();
        });

        this.ui.tile.new.click(function () {
            self.createTile(self.ui.tile.selection.val());
        })

        this.ui.recenter.click(function () {
            self.offset.x = 0;
            self.offset.y = 0;
            self.zoom = 1;
            self.ui.zoom.slider.val(100);
            self.ui.zoom.value.html("100%");
        });

        this.ui.grid.checkbox.prop('checked', self.grid.enabled);
        if (!this.grid.enabled) {
            this.ui.grid.count.prop('disabled', 'disabled');
        }
        this.ui.grid.count.val(self.grid.count);
        this.ui.diagonals.val(self.diagonals);

        this.ui.zoom.slider.val(100);
        this.ui.zoom.slider.change(function () {
            self.zoom = $(this).val() / 100;
            self.ui.zoom.value.html($(this).val() + "%");
        });

        this.ui.inspector.x.change(function () {
            self.selectedObject.x = $(this).val() * self.unit * Math.sqrt(self.ui.inspector.xMul.val());
        });

        this.ui.inspector.y.change(function () {
            self.selectedObject.y = $(this).val() * self.unit * Math.sqrt(self.ui.inspector.yMul.val());
        });

        this.ui.inspector.radius.change(function () {
            self.selectedObject.radius = $(this).val() * self.unit * Math.sqrt(self.ui.inspector.radiusMul.val());
        });

        this.ui.inspector.theta1.input.change(function () {
            self.selectedObject.theta = parseFloat($(this).val());
        });

        this.ui.inspector.rotation.input.change(function () {
            self.selectedObject.rotation = parseFloat($(this).val());
        })

        this.ui.inspector.xMul.change(function () {
            self.syncInspector();
        })

        this.ui.inspector.yMul.change(function () {
            self.syncInspector();
        })

        this.ui.inspector.radiusMul.change(function () {
            self.syncInspector();
        })

        this.ui.grid.checkbox.change(function () {
            if ($(this).is(':checked')) {
                self.grid.enabled = true;
                self.ui.grid.count.prop('disabled', false);
            } else {
                self.grid.enabled = false;
                self.ui.grid.count.prop('disabled', 'disabled');
            }
            self.updateGrid();
        });

        this.ui.diagonals.change(function () {
            if ($(this).is(':checked')) {
                self.diagonals = true;
            } else {
                self.diagonals = false;
            }
            self.updateDiagonals();
        });

        this.ui.snap.intersections.change(function () {
            if ($(this).is(':checked')) {
                self.snap.intersections = true;
            } else {
                self.snap.intersections = false;
            }
        });

        this.ui.grid.count.change(function () {
            self.grid.count = $(this).val();
            self.updateGrid();
        });
    }

    hideWindows() {
        this.ui.inspector.window.hide();
    }

    drawGrid() {
        // need to overhaul for generalized shapes...
        var squareSize = this.square.size;
        var stepSize = this.square.size / this.grid.count;
        var overflowAmt = 500;
        this.context.strokeStyle = "#000000";
        this.context.lineWidth = 0.5;
        this.context.beginPath();
        for (var i = stepSize; i < this.square.size - 1; i += stepSize) {
            //this.context.beginPath();
            this.context.moveTo(this.zoom * (-overflowAmt + this.offset.x), this.zoom * (i + this.offset.y));
            this.context.lineTo(this.zoom * (squareSize + this.offset.x + overflowAmt), this.zoom * (i + this.offset.y));
            //this.context.stroke();

            //this.context.beginPath();
            this.context.moveTo(this.zoom * (i + this.offset.x), this.zoom * (-overflowAmt + this.offset.y));
            this.context.lineTo(this.zoom * (i + this.offset.x), this.zoom * (squareSize + this.offset.y + overflowAmt));
            //this.context.stroke();
        }
        this.context.stroke();
    }

    showCircleInspector() {
        // show circle specific fields and hide others
        $(".ui-row").hide();
        $(".ui-circle").show();
    }

    showTileInspector() {
        $(".ui-row").hide();
        $(".ui-triangle").show();
    }

    drawDiagonals() {
        var squareSize = this.square.size;
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = "#000000";
        var arr = [
            [this.offset.x * this.zoom, this.offset.y * this.zoom],
            [(squareSize + this.offset.x) * this.zoom, (squareSize + this.offset.y) * this.zoom],
            [(squareSize + this.offset.x) * this.zoom, this.offset.y * this.zoom],
            [this.offset.x * this.zoom, (squareSize + this.offset.y) * this.zoom]
        ]
        this.context.beginPath();
        this.context.moveTo(...arr[0]);
        this.context.lineTo(...arr[1]);
        this.context.moveTo(...arr[2]);
        this.context.lineTo(...arr[3]);
        this.context.stroke();
    }

    updateObjects() {
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            obj.update();
        }
    }

    updateDiagonals() {
        this.diagonalLines = [];
        if (!this.diagonals) return;
        this.diagonalLines = [
            new Line({ x: 0, y: 0 }, { x: this.square.size, y: this.square.size }, false, true),
            new Line({ x: 0, y: this.square.size }, { x: this.square.size, y: 0 }, false, true),
        ];
    }

    updateGrid() {
        this.gridLines = []
        if (!this.grid.enabled) return;
        var squareSize = this.square.size;
        var stepSize = this.square.size / this.grid.count;
        for (var i = stepSize; i < this.square.size - 1; i += stepSize) {
            //this.context.beginPath();

            this.gridLines.push(new Line({ x: 0, y: i }, { x: squareSize, y: i }, false, true));
            this.gridLines.push(new Line({ x: i, y: 0 }, { x: i, y: squareSize }, false, true));


            //this.context.beginPath();
            // this.context.moveTo(thisv.zoom * (i + this.offset.x), this.zoom * (-overflowAmt + this.offset.y));
            // this.context.lineTo(this.zoom * (i + this.offset.x), this.zoom * (squareSize + this.offset.y + overflowAmt));
            //this.context.stroke();
        }
    }

    getIntersections() {

    }

    handleKeys() {
        if (this.selectedObject != null) {
            if (keyRegister.w) {
                this.selectedObject.y -= moveVelocity;
                this.updateObjects();
                this.syncInspector();
            }
            if (keyRegister.s) {
                this.selectedObject.y += moveVelocity;
                this.updateObjects();
                this.syncInspector();
            }
            if (keyRegister.d) {
                this.selectedObject.x += moveVelocity;
                this.updateObjects();
                this.syncInspector();
            }
            if (keyRegister.a) {
                this.selectedObject.x -= moveVelocity;
                this.updateObjects();
                this.syncInspector();
            }
            if (this.selectedObject instanceof Circle) {
                if (keyRegister.e) {
                    this.selectedObject.radius += moveVelocity;
                    this.updateObjects();
                    this.syncInspector();
                }
                if (keyRegister.q) {
                    this.selectedObject.radius -= moveVelocity;
                    this.updateObjects();
                    this.syncInspector();
                }
            } else if (this.selectedObject instanceof Triangle) {
                if (keyRegister.e) {
                    this.selectedObject.rotation += rotationVelocity;
                    this.updateObjects();
                    this.syncInspector();
                }
                if (keyRegister.q) {
                    this.selectedObject.rotation -= rotationVelocity;
                    this.updateObjects();
                    this.syncInspector();
                }
            }
            if (keyRegister.Delete) {
                var ind = this.objects.indexOf(this.selectedObject);
                if (ind > -1) {
                    this.objects.splice(ind, 1); // remove from obj list
                    this.selectObject(null); //remove selection
                    this.syncInspector();
                    this.updateObjects();
                }
            }
        }
    }

    get unit() {
        return this.square.size;
    }

    drawCircleConnections() {
        var threshold = 2;
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#3742fa"
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            if (obj instanceof Circle) {
                for (var k = i + 1; k < this.objects.length; k++) {
                    var other = this.objects[k];
                    if (other instanceof Circle) {
                        var d = dist(obj.coords, other.coords) - (obj.radius + other.radius);
                        if (d >= 0 && d < threshold) {
                            this.context.beginPath();
                            this.context.moveTo(obj.xRel(this.offset, this.zoom), obj.yRel(this.offset, this.zoom));
                            this.context.lineTo(other.xRel(this.offset, this.zoom), other.yRel(this.offset, this.zoom));
                            this.context.stroke();
                        }
                    }
                }
            }
        }
    }

    update() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ui.xOffset.html(this.offset.x);
        this.ui.yOffset.html(this.offset.y);
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            obj.draw(this.context, this.offset, this.zoom);
            // if (obj instanceof Triangle) {
            //     var lines = obj.lines();
            //     for (var k = 0; k < lines.length; k++) {
            //         lines[k].draw(this.context, this.offset, this.zoom);
            //     }
            // }
        }
        // draw lines between circles that "touch"!!!
        // get arrow key input for panning and resizing
        this.drawCircleConnections();
        if (this.grid.enabled) {
            this.drawGrid();
        }
        if (this.diagonals) {
            this.drawDiagonals();
        }
        // for (var i =0; i < this.diagonalLines.length; i++){
        //    this.diagonalLines[i].draw(this.context, this.offset, this.zoom)
        // }
        // for (var i = 0; i < this.gridLines.length; i++){
        //     this.gridLines[i].draw(this.context, this.offset, this.zoom)
        // } 
        this.handleKeys();
    }

    createCircle() {
        var hw = this.square.size / 2;
        var r1 = (Math.random() - 0.5) * hw;
        var r2 = (Math.random() - 0.5) * hw;
        var c = new Circle(this.square.x + hw + r1, this.square.y + hw + r2, this.square.size / 4, this);
        this.objects.push(c);
        this.updateObjects();
    }

    createTile(tileType) {
        var hw = this.square.size / 2;
        var r1 = (Math.random() - 0.5) * hw;
        var r2 = (Math.random() - 0.5) * hw;
        var theta = parseFloat(tileType);
        var l = Math.sqrt(2) * 0.5 * this.square.size;
        var t = new Triangle(this.square.x + hw + r1, this.square.y + hw + r2, theta, l, l, 0)
        this.objects.push(t);
        this.updateObjects();
    }

    globalDragStop() {
        if (this.globalDrag.dragging) {
            this.globalDrag.dragging = false;
            $("html").css("cursor", "default");
        } else if (this.objectDrag.dragging) {
            this.objectDrag.dragging = false;
        }
    }

    // Write out object data to the proper inspector window.
    syncInspector() {
        var obj = this.selectedObject;
        var unit = this.unit;
        this.hideWindows();
        if (obj instanceof Circle) {
            this.ui.inspector.window.show();
            this.showCircleInspector();
            this.ui.inspector.name.val(obj.name());
            this.ui.inspector.x.val((obj.x / unit) / Math.sqrt(this.ui.inspector.xMul.val()));
            this.ui.inspector.y.val((obj.y / unit) / Math.sqrt(this.ui.inspector.yMul.val()));
            this.ui.inspector.radius.val((obj.radius / unit) / Math.sqrt(this.ui.inspector.radiusMul.val()));
        } else if (obj instanceof Triangle) {
            this.ui.inspector.window.show();
            this.showTileInspector();
            this.ui.inspector.name.val(obj.name());
            this.ui.inspector.x.val((obj.x / unit) / Math.sqrt(this.ui.inspector.xMul.val()));
            this.ui.inspector.y.val((obj.y / unit) / Math.sqrt(this.ui.inspector.yMul.val()));
            this.ui.inspector.length1.input.val((obj.length1 / unit) / Math.sqrt(this.ui.inspector.length1.mul.val()));
            this.ui.inspector.length2.input.val((obj.length2 / unit) / Math.sqrt(this.ui.inspector.length2.mul.val()));
            this.ui.inspector.rotation.input.val(obj.rotation);
            this.ui.inspector.theta1.input.val(obj.theta);
        }
    }

    selectObject(obj) {
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].isSelected = false;
        }

        this.selectedObject = obj;

        if (obj instanceof Circle || obj instanceof Triangle) {
            this.hideWindows();
            obj.isSelected = true;
            this.syncInspector();
        }
    }

    // given relative (ui) coords (x, y), return the object underneath.
    getObjectUnderneath(coords) {
        for (var i = this.objects.length - 1; i >= 0; i--) {
            var obj = this.objects[i];
            if (obj.isPointInside(coords, this.offset, this.zoom)) {
                return obj;
            }
        }
        return null;
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