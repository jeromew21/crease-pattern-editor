function nDigitRand(n) {
    return Math.floor(Math.random() * Math.pow(10, n));
}

class Button {
    static html(domId, label, classes) {
        return '<div class="' + classes + '">'
            + '<button id="' + domId + '">' + label + '</button>'
            + '</div>';
    }

    constructor(parentId, classes, label, onClick) {
        this.labelText = label;
        this.onClick = onClick;

        var self = this;

        this.domId = "ui-" + label.replace(" ", "-") + nDigitRand(3);
        this.element = $(Button.html(this.domId, this.labelText, classes));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("click", "#" + this.domId, function (e) {
            self.onClick();
        })
    }
}

class Checkbox {
    static html(domId, value, label, classes) {
        var checked = " ";
        if (value) {
            checked = " checked ";
        }
        return '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + '</label>'
            + '<input type="checkbox"' + checked + 'name="' + domId + '" id="' + domId + '" />'
            + '</div>';
    }

    constructor(parentId, classes, label, value, onChange) {
        this.labelText = label + "&nbsp;";
        this.value = value;
        this.onChange = onChange;

        var self = this;

        this.domId = "ui-" + label.replace(" ", "-") + nDigitRand(3);
        this.element = $(Checkbox.html(this.domId, this.value, this.labelText, classes));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", "#" + this.domId, function (e) {
            var val = $(e.target).is(":checked");
            self.value = val;
            self.onChange(val);
        })

        this.onChange(this.value);
    }
}

class SlidingInput {
    static html(domId, value, label, classes, lo, hi) {
        return '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + '</label>'
            + '<input type="range" min="' + lo + '" max="' + hi + '" value="' + value + '" name="' + domId + '" id="' + domId + '" />'
            + '&nbsp;<span id="' + domId + '-display"></span>'
            + '</div>';
    }

    constructor(parentId, classes, label, value, lo, hi, mul, display, onChange) {
        this.labelText = label + ":&nbsp;";
        this.rawValue = parseInt(value);
        this.actualValue = this.rawValue * mul;
        this.onChange = onChange;
        this.min = lo;
        this.max = hi;
        this.multiplier = mul;
        this.displayFn = display;

        var self = this;

        this.domId = "ui-" + label.replace(" ", "-") + nDigitRand(3);
        this.element = $(SlidingInput.html(this.domId, this.rawValue, this.labelText, classes, this.min, this.max));

        var displaySelector = "#" + this.domId + "-display";

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", "#" + this.domId, function (e) {
            var rawVal = parseInt($(e.target).val())
            var val = rawVal * self.multiplier;
            self.rawValue = rawVal;
            self.actualValue = val;
            self.onChange(val);
            $(displaySelector).html(self.displayFn(val))
        })

        $(displaySelector).html(self.displayFn(this.actualValue))
        this.onChange(this.actualValue);
    }
}

class NumberInput {
    static html(domId, value, label, classes) {
        return '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + '</label>'
            + '<input type="number" value="' + value + '" name="' + domId + '" id="' + domId + '" />'
            + '</div>';
    }

    constructor(parentId, classes, label, value, onChange) {
        this.labelText = label + ":&nbsp;";
        this.value = parseInt(value);
        this.onChange = onChange;

        var self = this;

        this.domId = "ui-" + label.replace(" ", "-") + nDigitRand(3);
        this.element = $(NumberInput.html(this.domId, this.value, this.labelText, classes));

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", "#" + this.domId, function (e) {
            var val = parseInt($(e.target).val());
            self.value = val;
            self.onChange(val);
        })

        this.onChange(value);

    }
}

class FloatInput {
    static html(domId, value, label, classes, mul) {
        if (mul) {
            mul = ' * <select id="' + domId + '-sel"><option value=1 selected>1</option>'
                + '<option value=2>&#8730; 2</option>'
                + '<option value=3>&#8730; 3</option></select>';
        } else {
            mul = ""
        }
        return '<div class="' + classes + '"><label for="'
            + domId
            + '">' + label + '</label>'
            + '<input type="text" value="' + value + '" name="' + domId + '" id="' + domId + '" />'
            + mul
            + '</div>';
    }

    constructor(parentId, classes, label, value, mul, onChange) {
        this.labelText = label + ":&nbsp;";
        this.value = parseFloat(value);
        this.actualValue = this.value;
        this.onChange = onChange;

        this.multiplier = 1;

        var self = this;

        this.domId = "ui-" + label.replace(" ", "-") + nDigitRand(3);
        this.element = $(FloatInput.html(this.domId, this.value, this.labelText, classes, mul));

        var inputSelector = "#" + this.domId;
        var mulSelector = "#" + this.domId + "-sel";

        var parentElement = $("#" + parentId);
        parentElement.append(this.element);
        parentElement.on("change", inputSelector, function (e) {
            var elemVal = parseFloat($(e.target).val());
            var underlyingValue = elemVal * self.multiplier;
            self.value = elemVal;
            self.actualValue = underlyingValue;
            self.onChange(underlyingValue);
        })

        if (mul) {
            parentElement.on("change", mulSelector, function (e) {
                var val = parseInt($(e.target).val());
                self.multiplier = Math.sqrt(val);

                // actual value stays the same, we just want to change the shown value
                self.value = self.actualValue / self.multiplier;
                $(inputSelector).val(self.value);
            })
        }

        this.onChange(this.actualValue);

    }
}

const dragRatio = 1;
const moveVelocity = 1;
const rotationVelocity = .2;

var keyRegister = {
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    e: false,
    Delete: false
};

document.onkeydown = function (e) {
    keyRegister[e.key] = true;
}

document.onkeyup = function (e) {
    keyRegister[e.key] = false;
}

function degToRad(theta) {
    return theta * (Math.PI / 180);
}

function rotate(coords, origin, theta) {
    var sCoords = {
        x: coords.x - origin.x,
        y: coords.y - origin.y
    };

    var rad = degToRad(theta);

    var rotated = {
        x: sCoords.x * Math.cos(rad) - sCoords.y * Math.sin(rad),
        y: sCoords.x * Math.sin(rad) + sCoords.y * Math.cos(rad)
    }

    return {
        x: rotated.x + origin.x,
        y: rotated.y + origin.y
    }
}

function inBounds(coords, boundingRect) {
    var x = coords.x;
    var y = coords.y;
    return !(x < boundingRect.x || x > boundingRect.x + boundingRect.w
        || y < boundingRect.y || y > boundingRect.y + boundingRect.h);
}

function sign(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

function inBoundsTriangle(pt, v1, v2, v3) {
    var d1, d2, d3;
    var has_neg, has_pos;

    d1 = sign(pt, v1, v2);
    d2 = sign(pt, v2, v3);
    d3 = sign(pt, v3, v1);

    has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    //return true if all same sign (if on same side of all lines -> inside triangle)

    return !(has_neg && has_pos);
}


function dist(c1, c2) {
    var dx = c1.x - c2.x;
    var dy = c1.y - c2.y;

    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * For a line l and a point p, find point p1 that lies on l and creates a line perp to l with p 
 */
function axiom4(line, pt) {
    var x1 = line.c1.x;
    var y1 = line.c1.y;
    var x2 = line.c2.x;
    var y2 = line.c2.y;
    var x3 = pt.x;
    var y3 = pt.y;

    var m = (y2 - y1) / (x2 - x1);

    var thresh = .001;

    // Handle vert/horiz cases
    if (Math.abs(x2 - x1) < thresh) {
        return { x: x2, y: y3 };
    } else if (Math.abs(y2 - y1) < thresh) {
        return { x: x3, y: y2 };
    }

    var x = (-y1 + y3 + m * x1 + (x3 / m)) / (m + (1 / m));
    var y = y1 + m * x - m * x1;

    return { x: x, y: y };
}

var cb1 = new Checkbox("ui-settings", "base", "foo", true, function (value) {
    console.log(value);
});

var fp1 = new FloatInput("ui-settings", "base", "foo1", 0.01, true, function (value) {
    console.log(value);
})

var n1 = new NumberInput("ui-settings", "base", "bar", 500, function (value) {
    console.log(value);
})

var n2 = new SlidingInput("ui-settings", "base", "zoom", 100, 1, 200, 0.01, function (value) {
    return (Math.round(value * 100)) + "%";
}, function (value) {
    console.log(value);
})

var b12 = new Button("ui-settings", "base", "click me", function () {
    console.log("ow")
})