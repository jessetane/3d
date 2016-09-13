var Regl = require('regl')
var Dynamic = require('regl/lib/dynamic')
var mat4 = { copy: require('gl-mat4/copy') }
var E = require('./e')

module.exports = class ReglRenderer {
  static bindProp (name) {
    return Dynamic.define(1, name)
  }

  static bindThis (name) {
    return Dynamic.define(3, name)
  }

  static get defaultVert () {
    return `precision highp float;
      uniform mat4 projection, vantagePoint, transform;
      attribute vec3 position;
      void main () {
        gl_Position = projection * vantagePoint * transform * vec4(position, 1);
      }`
  }

  static get defaultFrag () {
    return `precision highp float;
      uniform vec4 color;
      void main () {
        gl_FragColor = color;
      }`
  }

  static get defaultOpts () {
    return {
      vert: this.bindThis('vert'),
      frag: this.bindThis('frag'),
      uniforms: {
        projection: this.bindProp('projection'),
        vantagePoint: this.bindProp('vantagePoint'),
        transform: this.bindThis('transform'),
        color: this.bindThis('color')
      },
      attributes: {
        position: this.bindThis('positions')
      },
      elements: this.bindThis('cells')
    }
  }

  constructor (canvas) {
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    this.canvas = canvas
    this.devicePixelRatio = window.devicePixelRatio
    this.regl = Regl(canvas)
    this.drawCalls = new Map()
    this.projection = []
  }

  resize () {
    var dpr = this.devicePixelRatio
    this.width = this.canvas.offsetWidth
    this.height = this.canvas.offsetHeight
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
    this.regl.poll()
  }

  addObject (object) {
    var draw = this.regl(object.reglOpts)
    this.drawCalls.set(object, draw)
  }

  removeObject (object) {
    this.drawCalls.delete(object)
  }

  render (camera) {
    var projection = mat4.copy(this.projection, camera.projection)
    var scale = projection[0]
    projection[0] = camera.fitDimension === 'width' ? scale : scale * camera.aspect
    projection[5] = camera.fitDimension === 'width' ? scale * camera.aspect : scale
    projection[10] = -E.value
    projection[14] = -0.1

    var vantagePoint = camera.vantagePoint

    this.regl.clear({
      depth: 1,
      color: [0, 0, 0, 0]
    })

    camera.scene.objects.forEach(object => {
      if (!object.reglOpts) return
      var draw = this.drawCalls.get(object)
      if (!draw) {
        this.addObject(object)
        draw = this.drawCalls.get(object)
      }

      draw.call(object, { projection, vantagePoint })
    })
  }
}
