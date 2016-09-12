var mat4 = {
  copy: require('gl-mat4/copy'),
  multiply: require('gl-mat4/multiply')
}
var E = require('./e')

module.exports = class DomRenderer {
  constructor (el) {
    el.style.position = 'absolute'
    el.style.top = '0'
    el.style.left = '0'
    el.style.width = '100%'
    el.style.height = '100%'
    el.style.transformStyle = 'preserve-3d'
    el.style.mozTransformStyle = 'preserve-3d'
    el.style.webkitTransformStyle = 'preserve-3d'
    this.el = el
    this.elements = new Map()
    this.cameraTransform = []
    this.objectTransform = []
    this.projection = []
    this.pixelsPerUnit = 256
  }

  resize () {
    this.width = this.el.offsetWidth
    this.height = this.el.offsetHeight
  }

  addObject (object) {
    var el = object.el
    el.style.position = 'absolute'
    el.style.top = '50%'
    el.style.left = '50%'
    el.style.transformStyle = 'preserve-3d'
    el.style.mozTransformStyle = 'preserve-3d'
    el.style.webkitTransformStyle = 'preserve-3d'
    this.el.appendChild(el)
    this.elements.set(object, el)
  }

  removeObject (object) {
    var el = this.elements.get(object)
    this.elements.delete(object)
    if (el) el.remove()
  }

  render (camera) {
    var pixelsPerUnit = this.pixelsPerUnit
    var transform = mat4.copy(this.cameraTransform, camera.vantagePoint)
    transform[12] *= pixelsPerUnit
    transform[13] *= pixelsPerUnit
    transform[14] *= pixelsPerUnit

    var projection = mat4.copy(this.projection, camera.projection)
    var scale = projection[0]
    var dimension = camera.fitDimension === 'width' ? this.width : this.height
    projection[0] = projection[5] = scale * (dimension / (pixelsPerUnit * 2))
    projection[11] /= pixelsPerUnit
    mat4.multiply(transform, projection, transform)

    camera.scene.objects.forEach(object => {
      if (!object.el) return
      var el = this.elements.get(object)
      if (!el) {
        this.addObject(object)
        el = this.elements.get(object)
      }

      var t = mat4.copy(this.objectTransform, object.domTransform || object.transform)
      t[12] *= pixelsPerUnit
      t[13] *= pixelsPerUnit
      t[14] *= pixelsPerUnit
      mat4.multiply(t, transform, t)

      el.style.transform = 'translate3d(-50%,-50%,0) matrix3d(' +
        E(t[0])  + ',' + -E(t[1])  + ',' + E(t[2])  + ',' + E(t[3])  + ',' +
        -E(t[4])  + ',' + E(t[5])  + ',' + -E(t[6])  + ',' + -E(t[7])  + ',' +
        E(t[8])  + ',' + -E(t[9])  + ',' + E(t[10]) + ',' + E(t[11]) + ',' +
        E(t[12]) + ',' + -E(t[13]) + ',' + E(t[14]) + ',' + E(t[15]) + ')'
    })
  }
}
