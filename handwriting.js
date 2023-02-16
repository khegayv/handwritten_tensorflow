class CustomHandwriting {

	constructor() {

		let $ = document.getElementById.bind(document);
		this.model = new Model
		this.drawingLineWidthEl = $("drawing-line-width")
		this.clearEl = $("clear-canvas")
		this.outputEl = $("output")
		this.canvas = new fabric.Canvas('handwriting', {backgroundColor: "#fff",isDrawingMode: true})
		this.canvas.freeDrawingBrush.color = "#183"
		this.resetField(true)
		this.resizeField()
		this.model.isWarmedUp.then(this.bindEvents.bind(this))
	}

	resetField(removeText = true) {

		this.canvas.clear()
		this.canvas.backgroundColor = "#fff"

		if(removeText) {
			this.outputEl.value = ""
			this.model.clearInput()
		}
	}
	resizeField() {

		this.canvas.setDimensions({
			width: window.innerWidth,
			height: window.innerHeight
		})
		this.canvas.calcOffset()
		this.canvas.renderAll()
	}
	captureDrawing() {

		let group = new fabric.Group(this.canvas.getObjects()),
			{ left, top, width, height } = group,
			scale = window.devicePixelRatio,
			image = this.canvas.contextContainer.getImageData(left*scale, top*scale, width*scale, height*scale);
		this.resetField(false)
		return image

	}


	bindEvents() {
		this.clearEl.onclick = this.resetField.bind(this)

		this.drawingLineWidthEl.onchange = ({target}) => {
			this.canvas.freeDrawingBrush.width = parseInt(target.value, 10) || 1
			target.previousSibling.innerHTML = target.value
		};

		this.canvas.freeDrawingBrush.width = parseInt(this.drawingLineWidthEl.value, 10) || 1
		this.drawingLineWidthEl.previousSibling.innerHTML = this.canvas.freeDrawingBrush.width

		let timerId = null,
			isTouchDevice = 'ontouchstart' in window,
			timeOutDuration = isTouchDevice ? 400 : 800,
			hasTimedOut = true;

		this.canvas.on("mouse:down", (options) => {
				if(hasTimedOut) this.resetField(false)
				hasTimedOut = false
				if(timerId) {
					clearTimeout(timerId)
					timerId = null
				}
			})
			
		this.canvas.on("mouse:up", () => {
				timerId = setTimeout(() => {
					hasTimedOut = true
					let [character, probability] = this.model.predict(this.captureDrawing())
					this.outputEl.value += (true || probability > 0.5) ? character : "?"
				}, timeOutDuration)
			})
		window.onresize = this.resizeField.bind(this)
	}
}

let handwriting = new CustomHandwriting;