class Canvas {
    static tools = {
        hand: 1,
        circle: 2,
        triangle: 3,
    };

    constructor(canvas) {
        this.canvas = canvas;
        this.context = null;

        this.zoom = 1;
        this.offset = { x: 50, y: 50 };

        this.paper = new Paper(500, 500, this);

        this.objects = [this.paper];

        this.selectedObjects = [];

        this.grid = {
            show: false,
        }

        this.tool = Canvas.tools.hand;

        this.mouse = {
            x: 0,
            y: 0
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
            dragging: false
        }

        this.circles = {
            show: true,
            radius: 100,
        }

        this.initUi();
        this.bindEvents();
    }

    bindEvents() {
        var self = this;

        this.translation = {
            x: 400.5,
            y: 100.5,
        }

        var resize = function () {
            self.canvas.style.height = "100%";
            self.canvas.style.width = "100%";

            self.canvas.height = self.canvas.offsetHeight;
            self.canvas.width = self.canvas.offsetWidth;
            // fix height and width permanently
            self.canvas.style.height = self.canvas.height + "px";
            self.canvas.style.width = self.canvas.width + "px";

            self.context = self.canvas.getContext('2d');
            self.context.translate(self.translation.x, self.translation.y);
            self.context.ImageSmoothingEnabled = false;
        }

        window.onresize = resize;
        resize();

        var handleMove = function (e) {
            var rect = self.canvas.getBoundingClientRect();
            self.mouse.x = e.clientX - rect.left - self.translation.x;
            self.mouse.y = e.clientY - rect.top - self.translation.y;

            if (self.objectDrag.dragging) {
                var dx = dragRatio * (self.objectDrag.x0 - self.mouse.x);
                var dy = dragRatio * (self.objectDrag.y0 - self.mouse.y);

                for (var i = 0; i < self.selectedObjects.length; i++) {
                    var obj = self.selectedObjects[i];
                    obj.x = obj.x0 - dx;
                    obj.y = obj.y0 - dy;
                }

                // self.updateObjects();
            }
            if (self.globalDrag.dragging) {
                // is dragging...?
                var dx = (1 / self.zoom) * dragRatio * (self.globalDrag.x0 - self.mouse.x);
                var dy = (1 / self.zoom) * dragRatio * (self.globalDrag.y0 - self.mouse.y);

                self.offset.x = self.globalDrag.offsetX0 - dx;
                self.offset.y = self.globalDrag.offsetY0 - dy;
            } else {
                // set cursor depending on object underneath
                if (self.tool == Canvas.tools.hand) {
                    if (self.getObjectUnderneath(self.mouse) == self.paper) {
                        $("html").css("cursor", "default");
                    } else {
                        $("html").css("cursor", "pointer");
                    }
                }
            }
        }

        var handleLeave = function (e) {
            self.dragStop();
            $("html").css("cursor", "default");
        }

        var handleDown = function (e) {
            if (self.tool == Canvas.tools.hand) {
                var obj = self.getObjectUnderneath(self.mouse);
                if (obj != null) {
                    if (obj instanceof Paper) {
                        self.deselect();
                    } else {
                        self.clickObject(obj);
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
            } else if (self.tool == Canvas.tools.circle) {
                var x = (self.mouse.x / self.zoom) - self.offset.x;
                var y = (self.mouse.y / self.zoom) - self.offset.y;
                var c = new Circle(x, y, self.circles.radius, self);
                self.objects.push(c);
            }
        }

        var handleUp = function (e) {
            self.dragStop();
        }

        var handleWheel = function (e) {
            e.preventDefault();
            var d = -1 * e.deltaY * 0.001;
            self.zoomElement.set(self.zoomElement.actualValue + d);
        }


        this.canvas.addEventListener("mousemove", handleMove);
        this.canvas.addEventListener("mousedown", handleDown);
        this.canvas.addEventListener("mouseup", handleUp);
        this.canvas.addEventListener("mouseleave", handleLeave);
        this.canvas.addEventListener("wheel", handleWheel);
        document.onkeydown = function (e) {
            keyRegister[e.key] = true;
            canvas.handleKeys();
        }

        document.onkeyup = function (e) {
            keyRegister[e.key] = false;
        }

    }

    initUi() {
        var self = this;

        new Button("toolbox", "base", "🤚", function () {
            self.switchTool(Canvas.tools.hand);
        });

        new Button("toolbox", "base", "🟠", function () {
            self.switchTool(Canvas.tools.circle);
        });

        new Button("toolbox", "base", "📐", function () {
            self.switchTool(Canvas.tools.triangle);
        });

        new MenuAction("file-menu-list", "Save", function () {

        });

        new MenuAction("file-menu-list", "Open", function () {

        });

        new MenuAction("file-menu-list", "Export", function () {

        });

        new MenuAction("edit-menu-list", "De-select", function () {
            self.deselect();
        });

        new MenuAction("edit-menu-list", "Delete", function () {
            self.delete();
        });

        new MenuAction("edit-menu-list", "Undo", function () {
            self.undo();
        });

        new MenuAction("edit-menu-list", "Redo", function () {
            self.redo();
        });

        new MenuAction("help-menu-list", "About", function () {

        });

        new MenuAction("view-menu-list", "Re-center", function () {
            self.offset.x = 50;
            self.offset.y = 50;
        })

        new Checkbox("ui-settings", "base", "Show circles", true, function (value) {
            self.circles.show = value;
        });

        new Checkbox("ui-settings", "base", "Show grid", false, function (value) {
            self.grid.show = value;
        });

        new Checkbox("ui-settings", "base", "Show main diagonals", true, function (value) {
            self.paper.showDiagonals = value;
        });

        this.zoomElement = new SlidingInput("ui-settings", "base", "Zoom", 100, 1, 300, .01, function (value) {
            return Math.round(value * 100) + "%";
        }, function (value) {
            self.zoom = value;
        });

        new FloatInput("ui-circle-tool", "base", "Radius", 0.25, true, function (value) {
            self.circles.radius = value * 500;
        })
    }

    undo() {

    }

    redo() {

    }

    delete() {
        for (var i = 0; i < this.selectedObjects.length; i++) {
            this.selectedObjects[i].delete();
        }
        this.deselect();
    }

    switchTool(tool) {
        this.tool = tool;
    }

    dragStop() {
        if (this.globalDrag.dragging) {
            this.globalDrag.dragging = false;
            $("html").css("cursor", "default");
        } else if (this.objectDrag.dragging) {
            this.objectDrag.dragging = false;
            this.objectDrag.obj0 = [];
            // add to motion stack...
        }
    }

    getObjectUnderneath(coords) {
        for (var i = this.objects.length - 1; i >= 0; i--) {
            var obj = this.objects[i];
            if (!obj.alive) continue;

            if (obj.isPointInside(coords)) {
                return obj;
            }
        }
        return null;
    }

    draw() {
        this.context.clearRect(-500, -500, this.canvas.width + 500, this.canvas.height + 500);
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            if (!obj.alive) continue;

            obj.draw();
        }
        if (this.tool == Canvas.tools.circle) {
            this.context.strokeStyle = Circle.black;
            this.context.lineWidth = 1;
            strokeCircle(this.context, this.mouse, this.circles.radius * this.zoom);
        } else if (this.tool == Canvas.tools.triangle) {
            this.context.strokeStyle = Circle.black;
            this.context.lineWidth = 1;
            this.context.beginPath()
            this.context.moveTo(this.mouse.x, this.mouse.y - 50);
            this.context.lineTo(this.mouse.x + 50, this.mouse.y + 50);
            this.context.lineTo(this.mouse.x - 50, this.mouse.y + 50);
            this.context.lineTo(this.mouse.x, this.mouse.y - 50);
            this.context.stroke();
        }
    }

    clickObject(obj) {
        if (keyRegister.Shift) {
            if (!this.selectedObjects.includes(obj)) {
                obj.isSelected = true;
                this.selectedObjects.push(obj);
            } else {
                obj.isSelected = false;
                this.selectedObjects.remove(obj);
                return; // end here
            }
        } else {
            if (this.selectedObjects.includes(obj)) {
                // pass
            } else {
                // select only obj
                this.deselect();
                obj.isSelected = true;
                this.selectedObjects = [obj];
            }
        }
        // init drag
        for (var i = 0; i < this.selectedObjects.length; i++) {
            var selObj = this.selectedObjects[i];
            selObj.x0 = selObj.x;
            selObj.y0 = selObj.y;
        }
        this.objectDrag.x0 = this.mouse.x;
        this.objectDrag.y0 = this.mouse.y;
        this.objectDrag.dragging = true;
    }

    deselect() {
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].isSelected = false;
        }
        this.selectedObjects = [];
    }

    handleKeys() {
        if (keyRegister.Delete) {
            this.delete();
        }
    }

    get ctx() {
        return this.context;
    }
}