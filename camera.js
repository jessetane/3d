var Object3d = require('./object')
var mat4 = {
  identity: require('gl-mat4/identity'),
  translate: require('gl-mat4/translate'),
  fromQuat: require('gl-mat4/fromQuat'),
  multiply: require('gl-mat4/multiply')
}
var quat = {
  rotateX: require('gl-quat/rotateX'),
  rotateY: require('gl-quat/rotateY'),
  multiply: require('gl-quat/multiply')
}
var vec3 = {
  negate: require('gl-vec3/negate')
}

module.exports = class Camera3d extends Object3d {
  constructor (opts) {
    super(opts)
    this.fit = 'auto'
    this.fov = Math.PI / 2
    this.zoom = 1
    this.angularDamping = 0.8
    this.projection = mat4.identity([])
    this.buffer1 = []
    this.buffer2 = []
    this.vantagePoint = []
    this.renderers = []
  }

  pointerDown (evt) {
    evt = super.pointerDown(evt)
    this.angularVelocity.set(0, 0, 0)
    this.touches = [ evt ]
  }

  pointerMove (evt) {
    evt = super.pointerMove(evt)
    var start = evt.start
    if (!start) return
    var w = evt.currentTarget.offsetWidth
    var h = evt.currentTarget.offsetHeight
    var dx = evt.changeX / w * Math.PI
    var dy = evt.changeY / h * Math.PI / 2
    var q = [0,0,0,1]
    quat.rotateX(q, q, dy)
    quat.rotateY(q, q, dx)
    this.rotation = quat.multiply([], q, start.rotation)
    if (this.touches.length > 1) {
      this.touches.shift()
    }
    this.touches.push(evt)
  }

  pointerUp (evt) {
    evt = super.pointerUp(evt)
    var a = this.touches[0]
    var b = this.touches[1]
    if (a && b) {
      var dx = a.layerX - b.layerX
      var dy = a.layerY - b.layerY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        dx /= -25
        dy /= -25
        this.angularVelocity.set(dy, dx, 0)
      }
    }
  }

  addRenderer (renderer) {
    this.renderers.push(renderer)
    this.resize()
  }

  removeRenderer (renderer) {
    this.renderers = this.renderers.filter(r => r !== renderer)
  }

  resize () {
    if (this.renderers.length === 0) return
    this.renderers.forEach(renderer => renderer.resize())
    var { width, height } = this.renderers[0]
    var fit = this.fit
    if (fit === 'auto') {
      fit = width > height ? 'height' : 'width'
    }
    this.aspect = fit === 'width' ? width / height : height / width
    this.fitDimension = fit
  }

  update () {
    super.update()

    // unit size of dimension to fit at origin
    var tangent = Math.tan(this.fov / 2)
    var opposite = this.zoom * tangent
    this.size = opposite * 2

    // projection transform (zoom and perspective)
    var scale = 1 / opposite
    this.projection[0] = scale
    this.projection[5] = scale
    this.projection[11] = -1 / this.zoom

    // vantage point transform
    mat4.identity(this.vantagePoint)
    vec3.negate(this.buffer1, this.origin)
    mat4.translate(this.vantagePoint, this.vantagePoint, this.buffer1)
    mat4.fromQuat(this.buffer2, this.rotation)
    mat4.multiply(this.vantagePoint, this.buffer2, this.vantagePoint)
  }

  render () {
    this.renderers.forEach(renderer => renderer.render(this))
  }
}
