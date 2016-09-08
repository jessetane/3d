var Scene3d = require('../scene')
var Object3d = require('../object')
var Camera3d = require('../camera')
var ReglRenderer = require('../regl-renderer')
var DomRenderer = require('../dom-renderer')

class Thing extends Object3d {
  constructor () {
    super()

    // things for the regl-renderer
    this.vert = ReglRenderer.defaultVert
    this.frag = ReglRenderer.defaultFrag
    this.reglOpts = ReglRenderer.defaultOpts
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
