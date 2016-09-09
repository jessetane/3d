var Body = require('cannon/src/objects/Body')
var mat4 = {
  fromRotationTranslation: require('gl-mat4/fromRotationTranslation')
}

module.exports = class Object3d extends Body {
  constructor (opts) {
    opts = opts || {}
    if (opts.mass === undefined) {
      opts.mass = 1
    }
    super(opts)
    this.pointerDown = this.pointerDown.bind(this)
    this.pointerMove = this.pointerMove.bind(this)
    this.pointerUp = this.pointerUp.bind(this)
    this._origin = []
    this._rotation = []
    this.transform = []
  }

  // location
  get origin () {
    var o = this.position
    this._origin = this._origin || []
    this._origin[0] = o.x
    this._origin[1] = o.y
    this._origin[2] = o.z
    return this._origin
  }
  set origin (o) {
    this._origin = o
    this.position.x = o[0]
    this.position.y = o[1]
    this.position.z = o[2]
  }

  // rotation
  get rotation () {
    var r = this.quaternion
    this._rotation = this._rotation || []
    this._rotation[0] = r.x
    this._rotation[1] = r.y
    this._rotation[2] = r.z
    this._rotation[3] = r.w
    return this._rotation
  }
  set rotation (r) {
    this._rotation = r
    this.quaternion.x = r[0]
    this.quaternion.y = r[1]
    this.quaternion.z = r[2]
    this.quaternion.w = r[3]
  }

  bindPointerEvents (el) {
    el.addEventListener('mousedown', this.pointerDown)
    el.addEventListener('touchstart', this.pointerDown)
    el.addEventListener('mouseup', this.pointerUp)
    el.addEventListener('touchend', this.pointerUp)
    el.addEventListener('mousemove', this.pointerMove)
    el.addEventListener('touchmove', this.pointerMove)
  }

  unbindPointerEvents (el) {
    el.removeEventListener('mousedown', this.pointerDown)
    el.removeEventListener('touchstart', this.pointerDown)
    el.removeEventListener('mouseup', this.pointerUp)
    el.removeEventListener('touchend', this.pointerUp)
    el.removeEventListener('mousemove', this.pointerMove)
    el.removeEventListener('touchmove', this.pointerMove)
  }

  pointerDown (evt) {
    evt = this.processEvent(evt)
    evt.type = 'pointerdown'
    evt.origin = this.origin.slice(),
    evt.rotation = this.rotation.slice()
    this.pointerStart = evt
    this.dispatchEvent(evt)
    return evt
  }

  pointerMove (evt) {
    evt = this.processEvent(evt)
    evt.type = 'pointermove'
    if (this.pointerStart) {
      evt.start = this.pointerStart
      evt.changeX = evt.layerX - this.pointerStart.layerX
      evt.changeY = evt.layerY - this.pointerStart.layerY
    }
    this.dispatchEvent(evt)
    return evt
  }

  pointerUp (evt) {
    evt = this.processEvent(evt)
    evt.type = 'pointerup'
    evt.start = this.pointerStart
    delete this.pointerStart
    evt.changeX = evt.layerX - evt.start.layerX
    evt.changeY = evt.layerY - evt.start.layerY
    this.dispatchEvent(evt)
    return evt
  }

  processEvent (raw) {
    raw.preventDefault()
    var target = raw.currentTarget
    var evt = {
      currentTarget: target,
      metaKey: raw.metaKey,
      ctrlKey: raw.ctrlKey,
      altKey: raw.altKey,
    }
    var point = raw
    if (raw.touches) {
      if (raw.changedTouches.length) {
        point = raw.changedTouches[0]
      } else {
        point = raw.touches[0]
      }
    }
    var rect = target.getBoundingClientRect()
    evt.layerX = point.clientX - rect.left
    evt.layerY = point.clientY - rect.top
    return evt
  }

  update () {
    mat4.fromRotationTranslation(this.transform, this.rotation, this.origin)
  }
}
