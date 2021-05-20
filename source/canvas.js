class Canvas {
    static tools = {
        hand: 1,
        circle: 2,
        triangle: 3,
    };

    /* The length of the paper as rendered on screen */
    static unit = 500;

    constructor(canvas) {
        this.canvas = canvas;
        this.context = null;

        this.translation = {
            x: 0, y: 0
        };

        this.zoom = 1;
        this.offset = { x: 0, y: 0 };

        this.paper = new Paper(Canvas.unit, Canvas.unit, this);

        this.objects = [this.paper];

        this.selectedObjects = [];

        this.actions = {
            stack: [],
            allocation: 1000,
            index: 0
        }

        for (var i = 0; i < this.actions.allocation; i++) {
            this.actions.stack.push(null);
        }

        this.grid = {
            show: false,
            count: 8
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

        var resize = function () {
            self.canvas.style.height = "100%";
            self.canvas.style.width = "100%";

            self.canvas.height = self.canvas.offsetHeight;
            self.canvas.width = self.canvas.offsetWidth;
            // fix height and width permanently
            self.canvas.style.height = self.canvas.height + "px";
            self.canvas.style.width = self.canvas.width + "px";

            var xt = self.canvas.width / 2 - (Canvas.unit / 2);
            var yt = self.canvas.height / 2 - (Canvas.unit / 2);

            xt = Math.floor(xt) + 0.5;
            yt = Math.floor(yt) + 0.5;

            self.translation.x = xt;
            self.translation.y = yt;

            self.context = self.canvas.getContext('2d');
            self.context.translate(xt, yt);
            self.context.ImageSmoothingEnabled = false;
        }

        window.onresize = resize;
        resize();

        var handleMove = function (e) {
            var rect = self.canvas.getBoundingClientRect();
            self.mouse.x = e.clientX - rect.left - self.translation.x;
            self.mouse.y = e.clientY - rect.top - self.translation.y;

            if (self.objectDrag.dragging) {
                var dx = (1 / self.zoom) * dragRatio * (self.objectDrag.x0 - self.mouse.x);
                var dy = (1 / self.zoom) * dragRatio * (self.objectDrag.y0 - self.mouse.y);

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

        new MenuAction("edit-menu-list", "Clear selection", function () {
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
            self.offset.x = 0;
            self.offset.y = 0;
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
            self.circles.radius = value * Canvas.unit;
        })
    }

    renderX(x) {
        return Math.floor(this.zoom * (this.offset.x + x));
    }

    renderY(y) {
        return Math.floor(this.zoom * (this.offset.y + y))
    }

    undo() {
        if (this.actions.index > 0) {
            this.actions.index -= 1;
            var action = this.actions.stack[this.actions.index];
            action.invert();
        } else {
            console.log("Undo operation not permitted")
        }
    }

    redo() {
        var action = this.actions.stack[this.actions.index];
        if (action != null) {
            this.actions.index += 1;
            action.apply();
        } else {
            console.log("Redo operation not permitted")
        }
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
            var subActions = [];
            for (var i = 0; i < this.selectedObjects.length; i++) {
                var obj = this.selectedObjects[i];
                subActions.push(
                    new MovementAction(obj, {
                        x: obj.x0,
                        y: obj.y0,
                    }, {
                        x: obj.x,
                        y: obj.y
                    })
                )
            }
            this.addAction(new MultiAction(subActions));
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
        this.context.clearRect(-Canvas.unit, -Canvas.unit, this.canvas.width + Canvas.unit, this.canvas.height + Canvas.unit);
        if (this.paper.show) {
            this.objects[0].draw(); // square 
        }
        if (this.grid.show) {
            this.drawGrid();
        }
        for (var i = 1; i < this.objects.length; i++) {
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

    addAction(action) {
        this.actions.stack[this.actions.index] = action;
        this.actions.index++;
        this.actions.stack[this.actions.index] = null;
        if (this.actions.index >= this.actions.allocation) {
            for (var i = 0; i < this.actions.allocation; i++) {
                this.actions.stack.push(null);
            }
        }
    }

    drawGrid() {
        // TODO: increase lines to outside of paper or filling the window
        var squareSize = this.paper.height;
        var stepSize = squareSize / this.grid.count;
        var overflowAmt = 500;
        this.context.strokeStyle = "#000000";
        this.context.lineWidth = 0.5;
        this.context.beginPath();
        for (var i = stepSize; i < squareSize - 1; i += stepSize) {
            //this.context.beginPath();
            this.context.moveTo(this.renderX(-overflowAmt), this.renderY(i));
            this.context.lineTo(this.renderX(squareSize + overflowAmt), this.renderY(i));
            //this.context.stroke();

            //this.context.beginPath();
            this.context.moveTo(this.renderX(i), this.renderY(-overflowAmt));
            this.context.lineTo(this.renderX(i), this.renderY(squareSize + overflowAmt));
            //this.context.stroke();
        }
        this.context.stroke();
    }

    get ctx() {
        return this.context;
    }
}
