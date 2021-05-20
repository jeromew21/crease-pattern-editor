const canvas = new Canvas(document.getElementById('canvas-main'));

function update() {
    window.requestAnimationFrame(update);
    canvas.draw();
}

update();
