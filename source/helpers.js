const dragRatio = 1;
const moveVelocity = 1;

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

function rotate(coords, origin) {
    
}

function inBounds(coords, boundingRect) {
    var x = coords.x;
    var y = coords.y;
    return !(x < boundingRect.x || x > boundingRect.x + boundingRect.w
        || y < boundingRect.y || y > boundingRect.y + boundingRect.h);
}

function dist(c1, c2) {
    var dx = c1.x - c2.x;
    var dy = c1.y - c2.y;

    return Math.sqrt(dx * dx + dy * dy);
}
