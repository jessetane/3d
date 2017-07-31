var World = require('cannon/src/world/World')

module.exports = class Scene3d extends World {
  get objects () {
    return this.bodies
  }

  constructor () {
    super()
    this.resize = this.resize.bind(this)
    this.timeStep = 1 / 60
    this.maxSubSteps = 3
    this.cameras = []
  }

  resize () {
    this.cameras.forEach(camera => camera.resize())
  }

  addObject (object) {
    object.scene = this
    if (object.renderers) {
      this.cameras.push(object)
    }
    this.addBody(object)
    if (object.connectedCallback) {
      object.connectedCallback()
    }
  }

  removeObject (object) {
    if (object.renderers) {
      this.cameras = this.cameras.filter(camera => camera != object)
    }
    this.cameras.forEach(camera => {
      camera.renderers.forEach(renderer => {
        renderer.removeObject(object)
      })
    })
    this.removeBody(object)
    if (object.disconnectedCallback) {
      object.disconnectedCallback()
    }
    delete object.scene
  }

  start () {
    this._frame = window.requestAnimationFrame(evt => {
      this.render(evt)
      if (this._frame) {
        this.start()
      }
    })
  }

  stop () {
    window.cancelAnimationFrame(this._frame)
    delete this._frame
  }

  render (time) {
    this.step(
      this.timeStep,
      time - this.time,
      this.maxSubSteps
    )
    this.objects.forEach(object => object.update())
    this.cameras.forEach(camera => camera.render())
  }
}
