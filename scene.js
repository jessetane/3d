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
  }

  removeObject (object) {
    delete object.scene
    if (object.renderers) {
      this.cameras = this.cameras.filter(camera => camera != object)
    }
    this.removeBody(object)
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
    this.cameras = []
    this.objects.forEach(object => {
      object.update()
      if (object.renderers) {
        this.cameras.push(object)
      }
    })
    this.cameras.forEach(camera => camera.render())
  }
}
