function initNormalBuffer(gl) {
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    const vertexNormals = [
        // Front
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

        // Back
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

        // Top
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

        // Bottom
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

        // Right
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

        // Left
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    ];

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertexNormals),
        gl.STATIC_DRAW,
    );

    return normalBuffer;
}

function initCubePositionBuffer(gl) {
    const positions = [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
    ];

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW
    );

    return {
        buffer: positionBuffer,
        vertCount: positions.length / 3
    };
}

function initCubeColorBuffer(gl) {
    const faceColors = [
        [1.0, 1.0, 1.0, 1.0], // Front
        [1.0, 0.0, 0.0, 1.0], // Back
        [0.0, 1.0, 0.0, 1.0], // Top
        [0.0, 0.0, 1.0, 1.0], // Bottom
        [1.0, 1.0, 0.0, 1.0], // Right
        [1.0, 0.0, 1.0, 1.0], // Left
    ];

    let colors = [];
    for (const c of faceColors) {
        colors.push(...c, ...c, ...c, ...c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(colors),
        gl.STATIC_DRAW
    );

    return colorBuffer;
}

function initIndexBuffer(gl) {
    const indices = [
        0, 1, 2, 0, 2, 3,      // front
        4, 5, 6, 4, 6, 7,      // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,// bottom
        16, 17, 18, 16, 18, 19,// right
        20, 21, 22, 20, 22, 23 // left
    ];

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
    );

    return indexBuffer;
}

function initBuffers(gl) {
    const position = initCubePositionBuffer(gl);
    const color = initCubeColorBuffer(gl);
    const indices = initIndexBuffer(gl);
    const normalBuffer = initNormalBuffer(gl);

    return {
        position: position.buffer,
        normal: normalBuffer,
        color: color,
        indices: indices,
        vertCount: position.vertCount
    };
}

export { initBuffers };
