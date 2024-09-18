var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  varying vec4 v_FragColor;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjMatrix;
  void main() {
    gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_FragColor = a_Color;
    gl_PointSize = 10.0;
  }`;

var FSHADER_SOURCE = `
  precision mediump float;
  varying vec4 v_FragColor;
  void main(){
    gl_FragColor = v_FragColor;
  }`;

// JS variables Inicialized
let drawCube = false;
let drawPyramid = false;
let currentVertex = [];
let currentFaces = [];
let currentColors = [];
let cubeVertex = [
  -0.5, -0.5, 0.5,
  0.5, -0.5, 0.5,
  0.5, 0.5, 0.5,
  -0.5, 0.5, 0.5,
  -0.5, -0.5, -0.5,
  0.5, -0.5, -0.5,
  0.5, 0.5, -0.5,
  -0.5, 0.5, -0.5
]
let cubeFaces = [
  0, 1, 2, 0, 2, 3,
  4, 5, 6, 4, 6, 7,
  0, 3, 7, 0, 7, 4,
  1, 5, 6, 1, 6, 2,
  3, 2, 6, 3, 6, 7,
  0, 1, 5, 0, 5, 4
]
let cubeColors = [
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random()
];
let pyramidVertex = [
  -0.5, 0.0, -0.5,
  0.5, 0.0, -0.5,
  0.5, 0.0, 0.5,
  - 0.5, 0.0, 0.5,
  0.0, 1.0, 0.0
]
let pyramidFaces = [
  0, 1, 2,
  0, 2, 3,
  0, 1, 4,
  1, 2, 4,
  2, 3, 4,
  3, 0, 4
]
let pyramidColors = [
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random(),
]

// HTML Variables Inicialized
let pyramidBtn = document.getElementById('pyramid');
let cubeBtn = document.getElementById('cube');
let resetBtn = document.getElementById('reset');
let rotateX = document.getElementById('rotateX');
let rotateY = document.getElementById('rotateY');
let rotateZ = document.getElementById('rotateZ');
let scaleX = document.getElementById('scaleX');
let scaleY = document.getElementById('scaleY');
let scaleZ = document.getElementById('scaleZ');
let moveX = document.getElementById('moveX');
let moveY = document.getElementById('moveY');
let moveZ = document.getElementById('moveZ');

// We get the values out of the HTML Variables
let rotValX = rotateX.value;
let rotValY = rotateY.value;
let rotValZ = rotateZ.value;
let scaleValX = scaleX.value;
let scaleValY = scaleY.value;
let scaleValZ = scaleZ.value;

// We divide the values o fthe variables to make a smoother move on the axis
let moveValX = moveX.value / 100;
let moveValY = moveY.value / 100;
let moveValZ = moveZ.value / 2;

function main() {
  var canvas = document.getElementById('webgl');
  var gl = getWebGLContext(canvas);

  if (!gl) {
    console.log('Failed to get the WebGL context');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders');
    return;
  }

  // We add the event listeners to update the values everytime the user inputs a new value and redraw the canvas 
  // Adds a new pyramid to the canvas
  pyramidBtn.addEventListener('click', () => {
    drawCube = false;
    drawPyramid = true;
    draw(gl);
  })
  // Adds a new cube to the canvas
  cubeBtn.addEventListener('click', () => {
    drawCube = true;
    drawPyramid = false;
    draw(gl);
  })

  // We listen to any value changes and update if there are any
  rotateX.addEventListener('input', () => {
    rotValX = rotateX.value;
    draw(gl);
  });
  rotateY.addEventListener('input', () => {
    rotValY = rotateY.value;
    draw(gl);
  })
  rotateZ.addEventListener('input', () => {
    rotValZ = rotateZ.value;
    draw(gl);
  })
  scaleX.addEventListener('input', () => {
    scaleValX = scaleX.value;
    draw(gl);
  })
  scaleY.addEventListener('input', () => {
    scaleValY = scaleY.value;
    draw(gl);
  })
  scaleZ.addEventListener('input', () => {
    scaleValZ = scaleZ.value;
    draw(gl);
  })
  moveX.addEventListener('input', () => {
    moveValX = moveX.value / 100;
    draw(gl);
  })
  moveY.addEventListener('input', () => {
    moveValY = moveY.value / 100;
    draw(gl);
  })
  moveZ.addEventListener('input', () => {
    moveValZ = moveZ.value / 2;
    draw(gl);
  })

  // Here we give the figure the default values
  resetBtn.addEventListener('click', () => {
    rotValX = 0;
    rotValY = 0;
    rotValZ = 0;
    scaleValX = 1;
    scaleValY = 1;
    scaleValZ = 1;
    moveValX = 0;
    moveValY = 0;
    moveValZ = 0;
    draw(gl);
  })

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  draw(gl);
}

// This function creates the buffers for the vertex, faces and colors. It also applies the users inputs to the figure on the canvas
// ans returns the length of the faces.
function initVertexBuffers(gl, vertices, faces, colors) {
  var n = faces.length;
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW); //Static= for when you want to draw something that you are not going to modify, dynamic= you can make occasional modifications, stream=constant modification

  var facesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, facesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get location of a_Position');
    return;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // Here we set the move, scale and rotation values the user gives us to the actual 3D figure
  var modelMatrix = new Matrix4();
  modelMatrix.translate(moveValX, moveValY, moveValZ);
  modelMatrix.scale(scaleValX, scaleValY, scaleValZ);
  modelMatrix.rotate(rotValX, 1, 0, 0);
  modelMatrix.rotate(rotValY, 0, 1, 0);
  modelMatrix.rotate(rotValZ, 0, 0, 1);

  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { console.log('Failed to get location of u_ModelMatrix'); }
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Here we can modify how we can view the 3D figures
  var viewMatrix = new Matrix4();
  viewMatrix.setLookAt(0.0, 0.0, 2.2, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) { console.log('Failed to get location of u_ViewMatrix'); }
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  // Here we specify how we want the 3D model to be painted
  var projMatrix = new Matrix4();
  projMatrix.setPerspective(60.0, 1.0, 0.1, 10.0);
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ProjMatrix) { console.log('Failed to get location of u_ProjMatrix'); }
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (!a_Color < 0) {
    console.log('Failed to get location of a_Color');
    return;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Color);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);

  return n;
}

function draw(gl) {
  // Before we draw anything on the canvas we clear everything
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  currentColors = []
  currentFaces = []
  currentVertex = []

  // We check which figure the user wants to draw
  if (drawCube) {
    currentColors = cubeColors;
    currentFaces = cubeFaces;
    currentVertex = cubeVertex;
  } else if (drawPyramid) {
    currentColors = pyramidColors;
    currentFaces = pyramidFaces;
    currentVertex = pyramidVertex;
  }

  var n = initVertexBuffers(gl, currentVertex, currentFaces, currentColors);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}



