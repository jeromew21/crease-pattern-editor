class Canvas {
    static tools = {
        hand: 1,
        circle: 2,
        triangle: 3,
    };

    constructor(canvas) {
        var self = this;

        this.canvas = canvas;

        var resize = function() {
            self.canvas.style.height = "100%";
            self.canvas.style.width = "100%";

            self.canvas.height = self.canvas.offsetHeight;
            self.canvas.width = self.canvas.offsetWidth;
            // fix height and width permanently
            self.canvas.style.height = self.canvas.height + "px";
            self.canvas.style.width = self.canvas.width + "px";

            self.context = self.canvas.getContext('2d');
            self.context.translate(0.5, 0.5);
            self.context.ImageSmoothingEnabled = false;
        }

        window.onresize = resize;
        resize();

        this.zoom = 1;
        this.offset = { x: 50, y: 50 };

        this.paper = new Paper(500, 500, this);

        this.objects = [this.paper];

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
            objX0: 0,
            objY0: 0,
            dragging: false
        }

        this.circles = {
            show: true,
        }

        var handleMove = function (e) {
            var rect = self.canvas.getBoundingClientRect();
            self.mouse.x = e.clientX - rect.left;
            self.mouse.y = e.clientY - rect.top;

            // if (self.objectDrag.dragging) {
            //     var dx = dragRatio * (self.objectDrag.x0 - self.mouse.x);
            //     var dy = dragRatio * (self.objectDrag.y0 - self.mouse.y);

            //     self.selectedObject.x = self.objectDrag.objX0 - dx;
            //     self.selectedObject.y = self.objectDrag.objY0 - dy;

            //     self.updateObjects();
            //     self.syncInspector();
            // }
            if (self.globalDrag.dragging) {
                // is dragging...?
                var dx = (2 - self.zoom) * dragRatio * (self.globalDrag.x0 - self.mouse.x);
                var dy = (2 - self.zoom) * dragRatio * (self.globalDrag.y0 - self.mouse.y);

                self.offset.x = self.globalDrag.offsetX0 - dx;
                self.offset.y = self.globalDrag.offsetY0 - dy;
            } else {
                // set cursor depending on object underneath
                if (self.tool == Canvas.tools.hand) {
                    if (self.getObjectUnderneath(self.mouse) == null) {
                        $("html").css("cursor", "pointer");
                    } else {
                        $("html").css("cursor", "default");
                    }
                }
            }
        }

        var handleLeave = function (e) {
            self.dragStop();
            $("html").css("cursor", "default");
        }

        var handleDown = function (e) {
            if (self.tool != Canvas.tools.hand) {
                return;
            }

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
            self.dragStop();
        }

        this.canvas.addEventListener("mousemove", handleMove);
        this.canvas.addEventListener("mousedown", handleDown);
        this.canvas.addEventListener("mouseup", handleUp);
        this.canvas.addEventListener("mouseleave", handleLeave);

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

        new MenuAction("edit-menu-list", "Delete", function () {

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

        new SlidingInput("ui-settings", "base", "Zoom", 100, 1, 200, .01, function (value) {
            return Math.round(value * 100) + "%";
        }, function (value) {
            self.zoom = value;
        });
    }

    undo() {

    }

    redo() {

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
        }
    }

    getObjectUnderneath(coords) {
        for (var i = this.objects.length - 1; i >= 0; i--) {
            var obj = this.objects[i];
            if (obj.isPointInside(coords)) {
                return obj;
            }
        }
        return null;
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            obj.draw();
        }
    }

    get ctx() {
        return this.context;
    }
}
