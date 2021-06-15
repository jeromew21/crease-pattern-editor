class Canvas {
    static tools = {
        hand: 1,
        circle: 2,
        triangle: 3,
    };

    /* The length of the paper as rendered on screen */
    static unit = 1000;

    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.setAttribute("tabindex", "0");

        this.context = null;

        this.pdr = 2;

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
        this.switchTool(Canvas.tools.hand);

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
        };

        this.circles = {
            show: true,
            radius: Canvas.unit / 10,
        };

        this.triangles = {
            length: Canvas.unit / 2,
        }

        this.snap = {
            enabled: true,
            distance: 20
        }

        this.inspector = {};

        this.initUi();
        this.bindEvents();

        this.updateInspector();
    }

    resize() {
        var self = this;
        self.canvas.style.height = "100%";
        self.canvas.style.width = "100%";

        // Set initial w/h based on style
        self.canvas.height = self.canvas.offsetHeight;
        self.canvas.width = self.canvas.offsetWidth;

        // fix height and width permanently (probably does nothing)
        self.canvas.style.height = self.canvas.height + "px";
        self.canvas.style.width = self.canvas.width + "px";

        // Mega increase pixel density of canvas
        self.canvas.height = Math.round(self.canvas.height * self.pdr);
        self.canvas.width = Math.round(self.canvas.width * self.pdr);

        var xt = self.canvas.width / 2 - (Canvas.unit / 2);
        var yt = self.canvas.height / 2 - (Canvas.unit / 2);

        // Make sure that we're on a 0.5 factor
        xt = Math.floor(xt) + 0.5;
        yt = Math.floor(yt) + 0.5;

        self.translation.x = xt;
        self.translation.y = yt;

        self.context = self.canvas.getContext('2d');
        self.context.translate(xt, yt);
        self.context.ImageSmoothingEnabled = false;
    }

    mouseMove(e) {
        var self = this;
        var rect = self.canvas.getBoundingClientRect();
        self.mouse.x = (self.pdr) * (e.clientX - rect.left) - self.translation.x;
        self.mouse.y = (self.pdr) * (e.clientY - rect.top) - self.translation.y;

        if (self.objectDrag.dragging) {
            var dx = (1 / self.zoom) * dragRatio * (self.objectDrag.x0 - self.mouse.x);
            var dy = (1 / self.zoom) * dragRatio * (self.objectDrag.y0 - self.mouse.y);

            for (var i = 0; i < self.selectedObjects.length; i++) {
                var obj = self.selectedObjects[i];
                obj.x = obj.x0 - dx;
                obj.y = obj.y0 - dy;
            }

            self.updateInspector();
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
                if (self.objectDrag.dragging) {
                    $("html").css("cursor", "move");
                } else {
                    var obj = self.getObjectUnderneath(self.mouse);
                    if (obj == self.paper) {
                        $("html").css("cursor", "default");
                    } else if (obj == null) {
                        $("html").css("cursor", "default");
                    } else if (obj instanceof Circle || obj instanceof Triangle) {
                        $("html").css("cursor", "default");
                    }
                }
            }
        }
    }

    mouseDown(e) {
        var self = this;
        if (e.which == 3) {
            e.preventDefault();
            return;
        }

        if (e.which == 2) {
            if (self.tool == Canvas.tools.hand && !self.globalDrag.dragging) {
                // init global drag
                self.globalDrag.dragging = true;
                self.globalDrag.x0 = self.mouse.x;
                self.globalDrag.y0 = self.mouse.y;
                self.globalDrag.offsetX0 = self.offset.x;
                self.globalDrag.offsetY0 = self.offset.y;
                $("html").css("cursor", "move");
            }
            return;
        }

        if (self.tool == Canvas.tools.hand) {
            var obj = self.getObjectUnderneath(self.mouse);
            if (obj != null) {
                self.clickObject(obj);
            } else {
                self.deselect();
            }
        } else if (self.tool == Canvas.tools.circle) {
            var x = (self.mouse.x / self.zoom) - self.offset.x;
            var y = (self.mouse.y / self.zoom) - self.offset.y;
            var c = new Circle(x, y, self.circles.radius, self);
            self.objects.push(c);
        } else if (self.tool == Canvas.tools.triangle) {
            var x = (self.mouse.x / self.zoom) - self.offset.x;
            var y = (self.mouse.y / self.zoom) - self.offset.y;
            var t = new Triangle(x, y, 45, self.triangles.length, self.triangles.length, 0, self);
            self.objects.push(t);
        }
    }

    bindEvents() {
        var self = this;


        window.onresize = function () {
            self.resize();
        };

        this.resize();

        var handleMove = function (e) {
            self.mouseMove(e);
        }

        var handleLeave = function (e) {
            self.dragStop();
            $("html").css("cursor", "default");
        }

        var handleDown = function (e) {
            self.mouseDown(e);
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
        this.canvas.addEventListener("contextmenu", function (e) {
            e.preventDefault(); return false;
        });
        this.canvas.addEventListener("keydown", function (e) {
            // console.log(e.key);
            e.preventDefault();
            keyRegister[e.key] = true;
            canvas.handleKeys();
            return false;
        })

        document.onkeyup = function (e) {
            e.preventDefault();
            keyRegister[e.key] = false;
            return false;
        }

    }

    initUi() {
        var self = this;
        this.zoomElement = null;

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

        new MenuAction("file-menu-list", "Export square", function () {
            self.zoomElement.set(1);
            self.offset.x = 0;
            self.offset.y = 0;
            self.draw();

            var canv2 = document.getElementById("canvas-secondary");
            canv2.width = self.paper.width;
            canv2.height = self.paper.height;
            var ctx2 = canv2.getContext('2d');
            ctx2.drawImage(self.canvas, self.translation.x, self.translation.y, canv2.width, canv2.height, 0, 0, canv2.width, canv2.height);
            var dataUrl = canv2.toDataURL("image/png");
            window.open(dataUrl);
        });

        new MenuAction("edit-menu-list", "Select all", function () {
            self.selectAll();

        });

        new MenuAction("edit-menu-list", "Clear selection", function () {
            self.deselect();
        });

        new MenuAction("edit-menu-list", "Delete", function () {
            self.delete();
        });

        new MenuAction("edit-menu-list", "Duplicate", function () {
            for (var i = 0; i < self.selectedObjects.length; i++) {
                var clone = self.selectedObjects[i].copy();
                self.objects.push(clone);
            }
        });


        new MenuAction("edit-menu-list", "Undo", function () {
            self.undo();
        });

        new MenuAction("edit-menu-list", "Redo", function () {
            self.redo();
        });

        new MenuAction("help-menu-list", "About", function () {
            window.open("https://github.com/jeromew21/crease-pattern-editor")
        });

        new MenuAction("view-menu-list", "Re-center", function () {
            self.offset.x = 0;
            self.offset.y = 0;
        })

        this.inspector = {
            name: new StringInput("ui-inspector", "inspector circle triangle", "Name", "", function (value) {
                self.setInspectorAttr("name", value);
            }),

            triangleMethod: new OptionInput("ui-inspector", "inspector triangle triangle-multi", "method", ["SAS", "COORDS"], "SAS", function (value) {
                alert(value);
            }),

            x: new FloatInput("ui-inspector", "inspector circle triangle", "x", 0, true, function (value) {
                self.setInspectorAttr("x", value * Canvas.unit);
            }, ""),

            y: new FloatInput("ui-inspector", "inspector circle triangle", "y", 0, true, function (value) {
                self.setInspectorAttr("y", value * Canvas.unit);
            }, ""),

            radius: new FloatInput("ui-inspector", "inspector circle circle-multi", "Radius", 0, true, function (value) {
                self.setInspectorAttr("radius", value * Canvas.unit);
            }, ""),

            l1: new FloatInput("ui-inspector", "inspector triangle triangle-multi", "l1", 0, true, function (value) {
                self.setInspectorAttr("l1", value * Canvas.unit);
            }, ""),

            l2: new FloatInput("ui-inspector", "inspector triangle triangle-multi", "l2", 0, true, function (value) {
                self.setInspectorAttr("l2", value * Canvas.unit);
            }, ""),

            theta: new FloatInput("ui-inspector", "inspector triangle triangle-multi", "theta", 0, false, function (value) {
                self.setInspectorAttr("theta", value);
            }, "°"),

            rotation: new FloatInput("ui-inspector", "inspector triangle triangle-multi", "rotation", 0, false, function (value) {
                self.setInspectorAttr("rotation", value);
            }, "°"),

            lock: new Checkbox("ui-inspector", "inspector circle triangle", "Lock", false, function (value) {
                self.setInspectorAttr("locked", value);
            }),
        }

        new Checkbox("ui-settings", "base", "Snap intersections", self.snap.enabled, function (value) {
            self.snap.enabled = value;
        });

        new Checkbox("ui-settings", "base", "Show paper", true, function (value) {
            self.paper.show = value;
        });

        new Checkbox("ui-settings", "base", "Show circles", true, function (value) {
            self.circles.show = value;
        });

        new Checkbox("ui-settings", "base", "Show grid", false, function (value) {
            self.grid.show = value;
        });

        new NumberInput("ui-settings", "base", "Grid denomination", this.grid.count, function (value) {
            self.grid.count = value;
        })

        new Checkbox("ui-settings", "base", "Show main diagonals", true, function (value) {
            self.paper.showDiagonals = value;
        });

        this.zoomElement = new SlidingInput("ui-settings", "base", "Zoom", 100, 1, 1000, .01, function (value) {
            return Math.round(value * 100) + "%";
        }, function (value) {
            self.zoom = value;
        });

        new FloatInput("ui-circle-tool", "base", "Radius", 0.25, true, function (value) {
            self.circles.radius = value * Canvas.unit;
        }, "")

        new SlidingInput("ui-settings", "advanced", "Pixel density", this.pdr, 1, 4, 1, function (value) { return value; }, function (value) {
            self.pdr = value;
            self.resize();
        });

        new Button("ui-settings", "base button-advanced", "Show advanced", function () {
            $(".button-advanced").hide();
            $(".advanced").show();
        })

        $(".advanced").hide();
    }

    renderX(x) {
        return Math.floor(this.zoom * (this.offset.x + x));
    }

    renderY(y) {
        return Math.floor(this.zoom * (this.offset.y + y))
    }

    renderCoord(c) {
        return {
            x: this.renderX(c.x),
            y: this.renderY(c.y)
        };
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
        $(".ui-tool").hide();
        if (tool == Canvas.tools.hand) {
            // pass
        } else if (tool == Canvas.tools.circle) {
            $("#ui-circle-tool").show();
        } else if (tool == Canvas.tools.triangle) {
            $("#ui-triangle-tool").show();
        }
    }

    dragStop() {
        if (this.globalDrag.dragging) {
            $("html").css("cursor", "default");
            this.globalDrag.dragging = false;
        } else if (this.objectDrag.dragging) {
            // handle snap here
            if (this.snap.enabled) {
                var objCoords = [];
                for (var i = 0; i < this.selectedObjects.length; i++) {
                    objCoords.push(...this.selectedObjects[i].points());
                }
                var mp = minPair(objCoords, this.calculateSnapPoints());
                var delta = mp.delta;
                if (norm(delta) < this.snap.distance) {
                    for (var i = 0; i < this.selectedObjects.length; i++) {
                        var obj = this.selectedObjects[i];
                        obj.x += delta.x;
                        obj.y += delta.y;
                    }
                    this.updateInspector();
                }
            }

            $("html").css("cursor", "default");
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
        } else if (this.tool == Canvas.tools.hand) {
            if (this.objectDrag.dragging && this.snap.enabled) {
                var objCoords = [];
                for (var i = 0; i < this.selectedObjects.length; i++) {
                    objCoords.push(...this.selectedObjects[i].points());
                }
                var mp = minPair(objCoords, this.calculateSnapPoints());
                var delta = mp.delta;
                if (norm(delta) < this.snap.distance) {
                    drawX(this.context, this.renderCoord(mp.snapCoord), 10);
                }
            }
        }
    }

    clickObject(obj) {
        if (obj instanceof Paper) {
            this.deselect();
            // console.log("Paper, no drag");
            return;
        }

        if (keyRegister.Shift) {
            // toggle selected or not, then exit
            if (this.selectedObjects.includes(obj)) {
                obj.isSelected = false;
                this.selectedObjects.remove(obj);
            } else {
                obj.isSelected = true;
                this.selectedObjects.push(obj);
            }
        } else {
            if (this.selectedObjects.includes(obj)) {
                // pass
                // we go to drag
            } else {
                // select only obj
                this.deselect();
                obj.isSelected = true;
                this.selectedObjects = [obj];
            }
            // init drag
            var anyLocked = false;
            for (var i = 0; i < this.selectedObjects.length; i++) {
                if (this.selectedObjects[i].locked) {
                    anyLocked = true;
                    break;
                }
            }
            if (!anyLocked) {
                for (var i = 0; i < this.selectedObjects.length; i++) {
                    var selObj = this.selectedObjects[i];
                    selObj.x0 = selObj.x;
                    selObj.y0 = selObj.y;
                }
                this.objectDrag.x0 = this.mouse.x;
                this.objectDrag.y0 = this.mouse.y;
                this.objectDrag.dragging = true;
            }
        }
        this.updateInspector();
    }

    setInspectorAttr(attrName, value) {
        if (this.selectedObjects.length == 1) {
            var obj = this.selectedObjects[0];
            // obj[attrName] = value;
            obj.setAttr(attrName, value);
        } else if (this.selectedObjects.length > 1 && allSameType(this.selectedObjects)) {
            // multi elements
            for (var i = 0; i < this.selectedObjects.length; i++) {
                var obj = this.selectedObjects[i];
                // obj[attrName] = value;
                obj.setAttr(attrName, value);
            }
        }
    }

    updateInspector() {
        if (this.selectedObjects.length == 1) {
            this.showInspector();
            var obj = this.selectedObjects[0];

            $(".inspector").hide(); // hide all inputs


            if (obj instanceof Circle) {
                $("." + "circle").show();
                this.inspector.radius.set(obj.radius / Canvas.unit);
            } else if (obj instanceof Triangle) {
                $("." + "triangle").show();
                this.inspector.l1.set(obj.l1 / Canvas.unit);
                this.inspector.l2.set(obj.l2 / Canvas.unit);
                this.inspector.theta.set(obj.theta);
                this.inspector.rotation.set(obj.rotation);
            }

            this.inspector.name.set(obj.name());
            this.inspector.x.set(obj.x / Canvas.unit);
            this.inspector.y.set(obj.y / Canvas.unit);
            this.inspector.lock.set(obj.locked);
        } else if (this.selectedObjects.length > 1 && allSameType(this.selectedObjects)) {
            // multiple elements...
            $(".inspector").hide(); // hide all inputs
            var obj = this.selectedObjects[0];
            if (obj instanceof Circle) {
                $(".circle-multi").show();
            } else if (obj instanceof Triangle) {
                $(".triangle-multi").show();
            }
        } else {
            this.hideInspector();
        }
    }

    selectAll() {
        var self = this;
        self.deselect();
        for (var i = 0; i < self.objects.length; i++) {
            var obj = self.objects[i];
            obj.isSelected = true;
            if (obj.selectable) {
                self.selectedObjects.push(obj);
            }
        }
        self.updateInspector();
    }

    deselect() {
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].isSelected = false;
        }
        this.selectedObjects = [];
        this.updateInspector();
    }

    hideInspector() {
        $("#ui-inspector").hide();
    }

    showInspector() {
        $("#ui-inspector").show();
    }

    calculateSnapPoints() {
        var pts = [];

        // corners
        pts.push({ x: 0, y: 0 });
        pts.push({ x: Canvas.unit, y: Canvas.unit });
        pts.push({ x: Canvas.unit, y: 0 });
        pts.push({ x: 0, y: Canvas.unit });

        if (this.paper.showDiagonals) {
            pts.push({ x: Canvas.unit / 2, y: Canvas.unit / 2 })
        }

        // grid snap points
        return pts;
    }

    handleKeys() {
        if (keyRegister.Control && keyRegister.a) {
            this.selectAll();
        }

        if (keyRegister.Delete) {
            this.delete();
        } else if ((keyRegister.Control && (keyRegister.Shift && keyRegister.z)) || (keyRegister.Control && keyRegister.y)) {
            this.redo();
        } else if (keyRegister.Control && keyRegister.z) {
            this.undo();
        } else if (keyRegister.d) {

        } else if (keyRegister.w) {

        } else if (keyRegister.s) {

        } else if (keyRegister.a) {

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
        this.context.strokeStyle = Paper.outline;
        this.context.lineWidth = penSize.line;
        this.context.beginPath();
        for (var i = stepSize; i < squareSize - 1; i += stepSize) {
            this.context.moveTo(this.renderX(-overflowAmt), this.renderY(i));
            this.context.lineTo(this.renderX(squareSize + overflowAmt), this.renderY(i));

            this.context.moveTo(this.renderX(i), this.renderY(-overflowAmt));
            this.context.lineTo(this.renderX(i), this.renderY(squareSize + overflowAmt));
        }
        this.context.stroke();
    }

    get ctx() {
        return this.context;
    }
}
