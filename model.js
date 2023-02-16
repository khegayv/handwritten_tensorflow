class Model {
	constructor()//includes entities to work with model: preparation - warming up model; creating space for handwritten input (canvas)
	{
		this.isWarmedUp = this.loadModel().then(this.warmUp.bind(this))
		this.alphabet = "abcdefghijklmnopqrstuvwxyz";
		this.characters = "0123456789" + this.alphabet.toUpperCase() + this.alphabet
		this.inputCanvas = document.getElementById("input-canvas")
 
	}
	warmUp() {
		this._model.predict(tf.randomNormal([1,28,28,1])).as1D().dataSync()
		this.isWarmedUp = true;
	}
	loadModel() {return tf.loadLayersModel("model/model.json").then(model => {this._model = model;})}

	
	preprocessImage(pixelData) 
	{

		const targetDim = 28,
			edgeSize = 2,
			resizeDim = targetDim-edgeSize*2,
			padVertically = pixelData.width > pixelData.height,
			maxPixel = Math.max(pixelData.width, pixelData.height),
			minPixel = Math.min(pixelData.width, pixelData.height),

		
			padSize = Math.round((maxPixel - minPixel)/2),

			padSquare = padVertically ? [[padSize,padSize], [0,0], [0,0]] : [[0,0], [padSize,padSize], [0,0]];

		let	tempImg = null;
		if(tempImg) tempImg.dispose();

		return tf.tidy(() => {
			let tensor = tf.browser.fromPixels(pixelData, 1).pad(padSquare, 255.0)
			tensor = tf.image.resizeBilinear(tensor, [resizeDim, resizeDim]).pad([[edgeSize,edgeSize], [edgeSize,edgeSize], [0,0]], 255.0)
			tensor = tf.scalar(1.0).sub(tensor.toFloat().div(tf.scalar(255.0)))
			tempImg = tf.keep(tf.clone(tensor))
			this.showInput(tempImg)
			return tensor.expandDims(0)
		});
	}
	predict(pixelData) {
		let tensor = this.preprocessImage(pixelData),
			prediction = this._model.predict(tensor).as1D(),

			argMax = prediction.argMax().dataSync()[0],
			probability = prediction.max().dataSync()[0],

			character = this.characters[argMax];
		return [character, probability]
	}

	clearInput() {
		[...this.inputCanvas.parentElement.getElementsByTagName("img")].map(el => el.remove())
		this.inputCanvas.getContext('2d').clearRect(0, 0, this.inputCanvas.width, this.inputCanvas.height)
	}


	showInput(tempImg) {

		let legacyImg = new Image
		legacyImg.src = this.inputCanvas.toDataURL("image/png")
		this.inputCanvas.parentElement.insertBefore(legacyImg, this.inputCanvas)
		tf.browser.toPixels(tempImg, this.inputCanvas)
	}

}
