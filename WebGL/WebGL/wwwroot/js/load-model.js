// https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html

"use strict";

async function main() {
    const start = Date.now();
    let ms = 0;
    const canvas = document.querySelector("#gl-canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    const vs = `
        attribute vec4 a_position;
        attribute vec3 a_normal;
        attribute vec4 a_color;
        attribute vec2 a_texcoord;

        uniform mat4 u_projection;
        uniform mat4 u_view;
        uniform mat4 u_world;

        varying vec3 v_normal;
        varying vec4 v_color;
        varying vec2 v_texcoord;

        void main() {
            gl_Position = u_projection * u_view * u_world * a_position;
            v_normal = mat3(u_world) * a_normal;
            v_color = a_color;
            v_texcoord = a_texcoord;
        }
    `;

    const fs = `
        precision mediump float;

        varying vec3 v_normal;
        varying vec4 v_color;
        varying vec2 v_texcoord;

        uniform sampler2D u_texture;
        uniform vec4 u_diffuse;
        uniform vec3 u_lightDirection;

        void main () {
            vec3 normal = normalize(v_normal);
            float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
            vec4 diffuse = u_diffuse * v_color;
            vec4 texColor = texture2D(u_texture, v_texcoord);
            gl_FragColor = vec4(texColor.rgb * fakeLight, texColor.a);
        }
    `;

    const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

    const ModelData = await fetch('/Models/ny_clean_up2.obj');
    const text = await ModelData.text();
    const obj = parseOBJ(text);
    const texture = loadTexture(gl, "/Models/tex.jpg");

    const parts = obj.geometries.map(({ data }) => {
        if (data.color) {
            if (data.position.length === data.color.length) {
                // it's 3. The our helper library assumes 4 so we need
                // to tell it there are only 3.
                data.color = { numComponents: 3, data: data.color };
            }
        } else {
            // there are no vertex colors so just use constant white
            data.color = { value: [1, 1, 1, 1] };
        }

        if (data.position.length === data.color.length) {
            // it's 3. The our helper library assumes 4 so we need
            // to tell it there are only 3.
            data.color = { numComponents: 3, data: data.color };
        }

        const vertexCount = data.position.length / 3;
        if (data.texcoord.length !== vertexCount * 2) {
            const fixed = new Array(vertexCount * 2).fill(0.5);
            for (let i = 0; i < data.texcoord.length; i++) {
                fixed[i] = data.texcoord[i];
            }
            data.texcoord = fixed;
        }


        const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
        return {
            material: {
                u_diffuse: [1, 1, 1, 1],
            },
            bufferInfo,
        };
    });    

    const cameraTarget = [0, 0, 0];
    const cameraPosition = [0, 2, 10];
    const zNear = 0.1;
    const zFar = 500;

    function degToRad(deg) {
        return deg * Math.PI / 180;
    }
    ms = Date.now() - start;
    console.log(`before first render: ${ms / 1000}`);
    function render(time) {
        time *= 0.001;  // convert to seconds

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        const fieldOfViewRadians = degToRad(60);
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

        const up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        const camera = m4.lookAt(cameraPosition, cameraTarget, up);

        // Make a view matrix from the camera matrix.
        const view = m4.inverse(camera);
        
        const sharedUniforms = {
            u_lightDirection: m4.normalize([-1, 3, 5]),
            u_view: view,
            u_projection: projection,
            u_texture: texture,
        };

        gl.useProgram(meshProgramInfo.program);

        // calls gl.uniform
        webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

        // Hvis modellen skal rotere
        const u_world = m4.yRotation(time);
        // Hvis modellen skal være stationær
        //const u_world = m4.identity();
        for (const {bufferInfo, material} of parts) {
            // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
            webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);

            // calls gl.uniform
            webglUtils.setUniforms(meshProgramInfo, {
                u_world,
                u_diffuse: material.u_diffuse,
            });

            // calls gl.drawArrays or gl.drawElements
            webglUtils.drawBufferInfo(gl, bufferInfo);
        }
        

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    ms = Date.now() - start;
    console.log(`End of main: ${ms / 1000}`);
}

// helper function to clean the obj file
function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];
    const objColors = [[0, 0, 0]];

    // same order as `f` indices
    const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
        objColors,
    ];

    // same order as `f` indices
    let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
        [],   // colors
    ];

    const geometries = [];
    let geometry;
    const materialLibs = [];
    let material = 'default';
    let object = 'default';
    let groups = ['default'];

    function newGeometry() {
        // If there is an existing geometry and it's
        // not empty then start a new one.
        if (geometry && geometry.data.position.length) {
            geometry = undefined;
        }
    }

    function setGeometry() {
        if (!geometry) {
            const position = [];
            const texcoord = [];
            const normal = [];
            const color = [];
            webglVertexData = [
                position,
                texcoord,
                normal,
                color,
            ];
            geometry = {
                object,
                groups,
                material,
                data: {
                    position,
                    texcoord,
                    normal,
                    color,
                },
            };
            geometries.push(geometry);
        }
    }

    function addVertex(vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);

            // if this is the position index (index 0) and we parsed
            // vertex colors then copy the vertex colors to the webgl vertex color data
            if (i === 0 && objColors.length > 1) {
                geometry.data.color.push(...objColors[index]);
            }
        });
    }

    const noop = () => { };

    const keywords = {
        v(parts) {
            // if there are more than 3 values here they are vertex colors
            if (parts.length > 3) {
                objPositions.push(parts.slice(0, 3).map(parseFloat));
                objColors.push(parts.slice(3).map(parseFloat));
            } else {
                objPositions.push(parts.map(parseFloat));
            }
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            setGeometry();
            for (let i = 1; i < parts.length - 1; ++i) {
                addVertex(parts[0]);
                addVertex(parts[i]);
                addVertex(parts[i + 1]);
            }
        },
        usemtl(parts, unparsedArgs) {
            material = unparsedArgs;
            newGeometry();
        },
        mtllib(parts, unparsedArgs) {
            materialLibs.push(unparsedArgs);
        },
        o(parts, unparsedArgs) {
            object = unparsedArgs;
            newGeometry();
        },
        s: noop,
        g(parts) {
            groups = parts;
            newGeometry()
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            continue;
        }
        handler(parts, unparsedArgs);
    }

    // remove any arrays that have no entries.
    for (const geometry of geometries) {
        if (!geometry.data.texcoord) {
            geometry.data.texcoord = [];
        }
    }

    return {
        materialLibs,
        geometries,
    };
}

function loadTexture(gl, url) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 255, 255, 255])
    );

    const img = new Image();
    img.src = url;
    img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            img
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };

    return tex;
}


main();