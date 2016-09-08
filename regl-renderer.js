var Regl = require('regl')
var Dynamic = require('regl/lib/dynamic')
var mat4 = { copy: require('gl-mat4/copy') }
var E = require('./e')

var reglProp = Dynamic.define.bind(null, 1)
var reglThis = Dynamic.define.bind(null, 3)

module.exports = class ReglRenderer {
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
      vert: reglThis('vert'),
      frag: reglThis('frag'),
      uniforms: {
        projection: reglProp('projection'),
        vantagePoint: reglProp('vantagePoint'),
        transform: reglThis('transform'),
        color: reglThis('color')
      },
      attributes: {
        position: reglThis('positions')
      },
      elements: reglThis('cells'),
    }
  }

  constructor (canvas) {
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    this.canvas = canvas
    this.regl = Regl(canvas)
    this.drawCalls = {}
    this.projection = []
  }

  resize () {
    var dpr = window.devicePixelRatio
    this.width = this.canvas.offsetWidth
    this.height = this.canvas.offsetHeight
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
  }

  setupDrawCall (object) {
    var draw = this.regl(object.reglOpts)
    this.drawCalls[object.id] = draw
    return draw
  }

  render (camera) {
    var projection = mat4.copy(this.projection, camera.projection)
    var scale = projection[0]
    projection[0] = camera.fitDimension === 'width' ? scale : scale * camera.aspect
    projection[5] = camera.fitDimension === 'width' ? scale * camera.aspect : scale
    projection[10] = -E.value

    var vantagePoint = camera.vantagePoint

    this.regl.poll()
    this.regl.clear({
      depth: 1,
      color: [0, 0, 0, 0]
    })

    camera.scene.objects.forEach(object => {
      if (!object.reglOpts) return
      var draw = this.drawCalls[object.id] || this.setupDrawCall(object)
      draw.call(object, { projection, vantagePoint })
    })
  }
}
