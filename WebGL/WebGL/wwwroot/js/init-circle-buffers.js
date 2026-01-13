const red = {
    red: 1.0,
    green: 0.0,
    blue: 0.0,
    alpha: 1.0
}

const green = {
    red: 0.0,
    green: 1.0,
    blue: 0.0,
    alpha: 1.0
}

const blue = {
    red: 0.0,
    green: 0.0,
    blue: 1.0,
    alpha: 1.0
}

function createFilledCirclePositions(radius = 1.0, segments = 64) {
    const positions = [];

    for (let i = 0; i <= segments; i++) {
        const angle1 = (i / segments) * Math.PI * 2;
        const angle2 = ((i - 1) / segments) * Math.PI * 2;

        // center
        positions.push([0, 0, 0]);

        // first edge point
        positions.push(
            [
                Math.cos(angle1) * radius,
                Math.sin(angle1) * radius,
                0
            ]
        );

        // second edge point
        positions.push(
            [
                Math.cos(angle2) * radius,
                Math.sin(angle2) * radius,
                0
            ]
        );
    }

    return { positions: positions.flat(), vertCount: positions.length }
}

function createDoughnutPositions(innerRadius = 0.5, outerRadius = 1.0, segments = 64) {
    const positions = [];

    for (let i = 0; i < segments; i++) {
        const angle1 = (i / segments) * Math.PI * 2;
        const angle2 = ((i + 1) / segments) * Math.PI * 2;

        // outer ring points
        const ox1 = Math.cos(angle1) * outerRadius;
        const oy1 = Math.sin(angle1) * outerRadius;
        const ox2 = Math.cos(angle2) * outerRadius;
        const oy2 = Math.sin(angle2) * outerRadius;

        // inner ring points
        const ix1 = Math.cos(angle1) * innerRadius;
        const iy1 = Math.sin(angle1) * innerRadius;
        const ix2 = Math.cos(angle2) * innerRadius;
        const iy2 = Math.sin(angle2) * innerRadius;

        // Triangle 1
        positions.push(
            [ox1, oy1, 0],
            [ix1, iy1, 0],
            [ox2, oy2, 0]
        );

        // Triangle 2
        positions.push(
            [ox2, oy2, 0],
            [ix1, iy1, 0],
            [ix2, iy2, 0]
        );
    }

    return { positions: positions.flat(), vertCount: positions.length }
}

function initCircleColorBuffer(gl, segments) {
    const colors = [];
    for (let i = 0; i <= segments; i++) {
        if (i < segments / 3) {
            colors.push(
                red.red,
                red.green,
                red.blue,
                red.alpha,
            );
        }
        else if (i >= segments / 3 && i < (segments / 3) * 2) {
            colors.push(
                green.red,
                green.green,
                green.blue,
                green.alpha,
            );
        }
        else {
            colors.push(
                blue.red,
                blue.green,
                blue.blue,
                blue.alpha,
            );
        }
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return colorBuffer;
}

function initCirclePositionBuffer(gl, radius = 1.0, segments = 64) {
    // Create a buffer for the square's positions.
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the square.
    //let positions = createFilledCirclePositions(radius, segments);
    let positions = createDoughnutPositions(0.8, radius, segments);

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.positions), gl.STATIC_DRAW);

    return {
        buffer: positionBuffer, vertCount: positions.vertCount
    };
}

function initBuffers(gl, radius, segments) {
    const positionBuffer = initCirclePositionBuffer(gl, radius, segments);
    const colorBuffer = initCircleColorBuffer(gl, positionBuffer.vertCount + 3);

    return {
        position: positionBuffer.buffer,
        color: colorBuffer,
        vertCount: positionBuffer.vertCount
    };
}

export { initBuffers };