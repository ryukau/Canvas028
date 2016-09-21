class Canvas {
  constructor(width, height, append) {
    this.canvas = document.createElement("canvas")
    this.width = width
    this.height = height
    this.canvas.width = width
    this.canvas.height = height
    this.context = this.canvas.getContext("2d")
    this.imageData = this.context.getImageData(0, 0, width, height)
    this.pixels = this.imageData.data

    if (append !== false) {
      document.body.appendChild(this.canvas)
    }

    this.center = this.getCenter()
  }

  get CurrentPixels() {
    this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
    this.pixels = this.imageData.data
    return this.pixels
  }

  set visible(isVisible) {
    if (isVisible) {
      canvas.sytle.display = "inline"
    }
    else {
      canvas.style.display = "none"
    }
  }

  getCenter() {
    return new Vec2(this.canvas.width / 2, this.canvas.height / 2)
  }

  drawPath(vertices) {
    if (vertices.length < 1) {
      return
    }

    this.context.beginPath()
    this.context.moveTo(vertices[0].x, vertices[0].y)
    for (var i = 1; i < vertices.length; ++i) {
      this.context.lineTo(vertices[i].x, vertices[i].y)
    }
    this.context.closePath()
    this.context.fill()
    this.context.stroke()
  }

  drawPoints(points, radius) {
    for (var index = 0; index < points.length; ++index) {
      this.drawPoint(points[index], radius)
    }
  }

  drawNumbers(points) {
    for (var index = 0; index < points.length; ++index) {
      this.context.fillText(index, points[index].x, points[index].y)
    }
  }

  drawText(point, text) {
    // this.context.font = "12px serif"
    this.context.fillText(text, point.x, point.y)
  }

  drawLine(a, b) {
    this.context.beginPath()
    this.context.moveTo(a.x, a.y)
    this.context.lineTo(b.x, b.y)
    this.context.stroke()
  }

  drawPoint(point, radius) {
    this.context.beginPath()
    this.context.arc(point.x, point.y, radius, 0, Math.PI * 2, false)
    this.context.fill()
  }

  clearWhite() {
    this.context.fillStyle = "#ffffff"
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fill()
  }

  clear(color) {
    this.context.fillStyle = color
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fill()
  }

  resetTransform() {
    this.context.transform(1, 0, 0, 1, 0, 0)
  }

  putPixels() {
    this.context.putImageData(this.imageData, 0, 0)
  }

  setPixel(x, y, color) {
    var index = (y * this.canvas.width + x) * 4
    this.pixels[index + 0] = color.r
    this.pixels[index + 1] = color.g
    this.pixels[index + 2] = color.b
    this.pixels[index + 3] = color.a
  }

  feedback(alpha, white) {
    for (var y = 0; y < this.canvas.height; ++y) {
      for (var x = 0; x < this.canvas.width; ++x) {
        var index = (y * this.canvas.width + x) * 4
        this.pixels[index + 0] = Math.min(this.pixels[index + 0] * white, 255) // R
        this.pixels[index + 1] = Math.min(this.pixels[index + 1] * white, 255) // G
        this.pixels[index + 2] = Math.min(this.pixels[index + 2] * white, 255) // B
        this.pixels[index + 3] *= alpha // A
      }
    }
    this.context.putImageData(this.imageData, 0, 0)
  }
}

class Timer {
  constructor() {
    this.now = Date.now() * 0.001
    this.delta = 0
    this.zero = this.now
    this.lap = 0
    this.isPausing = true
  }

  tick() {
    var now = Date.now() * 0.001
    if (this.isPausing) {
      this.isPausing = false
      this.delta = 0
    }
    else {
      this.delta = now - this.now
      this.lap += this.delta
    }
    this.now = now
  }

  pause() {
    this.isPausing = true
  }
}
