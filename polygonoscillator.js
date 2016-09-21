class Polygon2D {
  constructor(radius, theta, type, poly) {
    this.radius = radius
    this.rotation = theta
    this.vertices = this.setVertices(type, poly)
    this.fill = "rgba(0, 0, 0, 0)"
    this.stroke = "#aaaaaa"
    this.lineWidth = 5

  }

  setVertices(type, poly) {
    if (type === "star") {
      return this.star(poly)
    }
    else if (type === "regular") {
      return this.regularPolygon(poly)
    }
    return this.regularPolygon(poly)
  }

  star(n) {
    n *= 2
    var vertices = new Array(n)
    var vector = new Vec2(this.radius, 0)
    var dtheta = 2 * Math.PI / vertices.length
    for (var i = 0; i < vertices.length; ++i) {
      vertices[i] = vector.clone().rotate(this.rotation + dtheta * i)
      vertices[i].mul((i % 2 + 0.5) * 2 / 3)
    }
    return vertices
  }

  regularPolygon(n) {
    var vertices = new Array(n)
    var vector = new Vec2(this.radius, 0)
    var dtheta = 2 * Math.PI / vertices.length
    for (var i = 0; i < vertices.length; ++i) {
      vertices[i] = vector.clone().rotate(this.rotation + dtheta * i)
    }
    return vertices
  }

  draw(canvas) {
    canvas.context.fillStyle = this.fill
    canvas.context.strokeStyle = this.stroke
    canvas.context.lineWidth = this.lineWidth
    canvas.context.lineJoin = "round"
    canvas.drawPath(this.vertices)

    // ここで回転させたほうが簡単。
    // for (var i = 0; i < this.vertices.length; ++i) {
    //   this.vertices[i].rotate(Math.PI * 0.0001)
    // }
  }
}

class HalfLine {
  // vertices[0] = a が始点。
  constructor(a, b) {
    this.vertices
    this.direction
    this.stroke = "#aaaaaa"
    this.lineWidth = 5

    this.set(a, b)
  }

  set(a, b) {
    this.vertices = [a, b]
    this.direction = this.getDirection()
  }

  getDirection() {
    var a = this.vertices[0]
    var b = this.vertices[1]
    return b.clone().sub(a).normalize()
  }

  rotate(theta) {
    this.direction.rotate(theta)
    this.vertices[1] = this.vertices[0].clone().add(this.direction)
  }

  draw(canvas) {
    var length = canvas.width + canvas.height
    var start = this.vertices[0]
    var end = this.direction.clone().mul(length).add(start)
    canvas.context.strokeStyle = this.stroke
    canvas.context.lineWidth = this.lineWidth
    canvas.context.lineCap = "round"
    canvas.drawLine(start, end)
  }
}

class Line {
  constructor(a, b, stroke) {
    this.vertices
    this.direction
    this.stroke = stroke
    this.lineWidth = 1

    this.set(a, b)
  }

  set(a, b) {
    this.vertices = [a, b]
    this.direction = this.getDirection()
  }

  getDirection() {
    var a = this.vertices[0]
    var b = this.vertices[1]
    return b.clone().sub(a).normalize()
  }

  rotate(theta) {
    this.direction.rotate(theta)
    this.vertices[1] = this.vertices[0].clone().add(this.direction)
  }

  draw(canvas) {
    var length = canvas.width + canvas.height
    var start = this.direction.clone().mul(-length).add(this.vertices[0])
    var end = this.direction.clone().mul(length).add(this.vertices[0])
    canvas.context.strokeStyle = this.stroke
    canvas.context.lineWidth = this.lineWidth
    canvas.context.lineCap = "round"
    canvas.drawLine(start, end)
  }
}

class Waveform extends Canvas {
  constructor(x, y, stroke) {
    super(x, y, false)
    this.waveform = [0]
    this.stroke = stroke
  }

  push(value) {
    this.waveform.push(value)
    if (this.waveform.length > this.width) {
      this.waveform.shift()
    }
  }

  draw() {
    this.clearWhite()
    var context = this.context
    var waveform = this.waveform

    context.save()
    context.translate(0, this.center.y)
    {
      context.strokeStyle = this.stroke
      context.lineWidth = 3
      context.lineJoin = "round"
      context.beginPath()
      context.moveTo(0, waveform[0])
      for (var i = 1; i < waveform.length; ++i) {
        context.lineTo(i, waveform[i])
      }
      context.stroke()
    }
    context.restore()
  }
}

///////////////////////////////////////////////////////////////////////////////
var canvasOscillator = new Canvas(256, 256, false)
var waveformY = new Waveform(512, 256, "#ffaaaa")
var waveformX = new Waveform(512, 256, "#ffcc44")

canvasOscillator.canvas.addEventListener("click", (event) => {
  var type = (Math.random() > 0.5) ? "regular" : "star"
  var poly = 3 + Math.floor(Math.random() * 8)
  polygon = new Polygon2D(canvasOscillator.center.x, 0, type, poly)
}, false)
canvasOscillator.canvas.style.position = "absolute"
canvasOscillator.canvas.style.top = "0px"
canvasOscillator.canvas.style.left = "0px"
waveformX.canvas.style.position = "absolute"
waveformX.canvas.style.top = "0px"
waveformX.canvas.style.left = "260px"
waveformY.canvas.style.position = "absolute"
waveformY.canvas.style.top = "260px"
waveformY.canvas.style.left = "260px"

var divCanvases = document.createElement("div")
divCanvases.style.position = "relative"
divCanvases.appendChild(canvasOscillator.canvas)
divCanvases.appendChild(waveformX.canvas)
divCanvases.appendChild(waveformY.canvas)

var divMain = document.getElementById("main")
divMain.appendChild(divCanvases)

var timer = new Timer()

var halfline = new HalfLine(new Vec2(0, 0), new Vec2(1, 0))
var polygon = new Polygon2D(canvasOscillator.center.x, 0, "regular", 6)
var baselineX = new Line(new Vec2(0, 0), new Vec2(1, 0), "#4444ff")
var baselineY = new Line(new Vec2(0, 0), new Vec2(0, 1), "#44ffff")
var point = new Vec2(0, 0)
var pointToBaselineX = new Vec2(1, 0)
var pointToBaselineY = new Vec2(0, 0)

animate()
function animate() {
  move()
  hitTest()
  draw()

  timer.tick()

  requestAnimationFrame(animate)
}

function move() {
  halfline.rotate(-timer.delta)
  baselineX.rotate(Math.PI * 0.0001)
  baselineY.rotate(Math.PI * 0.0001)
}

function hitTest() {
  var intersection = intersectHalflinePolygon(halfline, polygon)
  if (intersection !== null) {
    point = intersection
    pointToBaselineX = nearestPointLine(
      point,
      baselineX.vertices[0],
      baselineX.vertices[1]
    )
    pointToBaselineY = nearestPointLine(
      point,
      baselineY.vertices[0],
      baselineY.vertices[1]
    )
    waveformX.push(
      pointToBaselineX.length()
      * Math.sign(pointToBaselineX.dot(baselineX.direction))
    )
    waveformY.push(
      pointToBaselineY.length()
      * Math.sign(pointToBaselineY.dot(baselineY.direction))
    )
    // waveformX.push(point.x)
    // waveformY.push(point.y)
  }
}

function draw() {
  canvasOscillator.clearWhite()

  var context = canvasOscillator.context
  context.save()
  context.translate(canvasOscillator.center.x, canvasOscillator.center.y)
  {
    baselineX.draw(canvasOscillator)
    baselineY.draw(canvasOscillator)
    polygon.draw(canvasOscillator)
    halfline.draw(canvasOscillator)

    context.strokeStyle = "#aaaaaa"
    context.lineWidth = 1
    canvasOscillator.drawLine(point, pointToBaselineX)
    canvasOscillator.drawLine(point, pointToBaselineY)

    context.fillStyle = "#aaffaa"
    canvasOscillator.drawPoint(point, 3)
    context.fillStyle = "#ffaaaa"
    canvasOscillator.drawPoint(pointToBaselineX, 3)
    context.fillStyle = "#ffcc44"
    canvasOscillator.drawPoint(pointToBaselineY, 3)
  }
  context.restore()

  waveformX.draw()
  waveformY.draw()
}
