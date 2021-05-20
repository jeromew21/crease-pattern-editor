class CanvasAction {
    constructor() {

    }

    invert() { }

    apply() { }
}

class MovementAction extends CanvasAction {
    constructor(obj, c0, c1) {
        super();
        this.obj = obj;
        this.c0 = c0;
        this.c1 = c1;
    }

    invert() {
        this.obj.x = this.c0.x;
        this.obj.y = this.c0.y;
    }

    apply() {
        this.obj.x = this.c1.x;
        this.obj.y = this.c1.y;
    }
}

class CreateAction extends CanvasAction {
    constructor() { }
}

class DeleteAction extends CanvasAction {
    constructor() {

    }
}

class MultiAction extends CanvasAction {
    constructor(actionList) {
        super();
        this.actionList = actionList;
    }

    invert() {
        for (var i = 0; i < this.actionList.length; i++) {
            this.actionList[i].invert();
        }
    }

    apply() {
        for (var i = 0; i< this.actionList.length; i++) {
            this.actionList[i].apply();
        }
    }
}