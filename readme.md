# 3d
[cannon.js](https://github.com/schteppe/cannon.js) + [regl](https://github.com/regl-project/regl) + [matrix3d](https://www.w3.org/TR/css-transforms-1/#funcdef-matrix3d)

(better name TBD)

## Why
* [three.js](https://github.com/mrdoob/three.js) is awesome, but it's really big.
* Animating with physics makes it easy to bring a 3d scene to life.
* Rendering text or 2d user interfaces in WebGL is hard, matrix3d lets you just use the DOM!

## Example
Run the included example:
```shell
$ npm run example
```

The code (assumes some boilerplate HTML and CSS, see the example folder for details):
```javascript
var Scene3d = require('3d/scene')
var Object3d = require('3d/object')
var Camera3d = require('3d/camera')
var ReglRenderer = require('3d/regl-renderer')
var DomRenderer = require('3d/dom-renderer')

class Thing extends Object3d {
  constructor () {
    super()

    // things for the regl-renderer
    this.vert = ReglRenderer.defaultVert
    this.frag = ReglRenderer.defaultFrag
    this.createDrawCall = regl => regl(ReglRenderer.getDefaultOpts(regl))
    this.color = [1, 0, 0, 1]
    this.positions = [
      [-0.5, 0.5, 0],
      [0.5, 0.5, 0],
      [-0.5, -0.5, 0]
    ]
    this.cells = [
      [0, 1, 2]
    ]

    // things for the dom-renderer
    this.el = document.createElement('div')
    this.el.classList.add('thing')
    this.el.style.width = '256px'
    this.el.style.height = '256px'
  }
}

var scene = new Scene3d()
window.addEventListener('resize', scene.resize)

var camera = new Camera3d()
camera.origin = [0,0,0]
camera.zoom = 3
camera.fov = Math.PI / 4

var canvas = document.querySelector('#regl')
var reglRenderer = new ReglRenderer(canvas)
camera.addRenderer(reglRenderer)

var div = document.querySelector('#dom')
var domRenderer = new DomRenderer(div)
domRenderer.pixelsPerUnit = 256
camera.addRenderer(domRenderer)

var a = new Thing()
a.origin = [-0.5,0.5,0]
a.el.textContent = 'A'
scene.addObject(a)

var b = new Thing()
b.origin = [0.5,-0.5,0]
b.color = [0,0,1,1]
b.el.style.backgroundColor = 'rgba(0,0,255,0.5)'
b.el.textContent = 'B'
b.angularDamping = 0.5
b.angularVelocity.set(10 + Math.random() * 10, 0, 0)
scene.addObject(b)

camera.bindPointerEvents(div)
scene.addObject(camera)
scene.start()
```

## License
MIT
