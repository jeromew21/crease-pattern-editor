const dragRatio = 1;
const moveVelocity = 1;
const rotationVelocity = .2;
const fuzzyThreshold = 1.0;

var penSize = {
    line: 2,
}

var keyRegister = {
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    e: false,
    z: false,
    y: false,
    Control: false,
    Delete: false,
    Shift: false,
};

function degToRad(theta) {
    return theta * (Math.PI / 180);
}

function fuzzyEquals(x, y) {
    return Math.abs(x - y) < fuzzyThreshold;
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

function strokeCircle(ctx, coords, r) {
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, r, 0, 2*Math.PI);
    ctx.stroke();
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
