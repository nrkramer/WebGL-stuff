function Model(vertices) {
	this.vertices = vertices;
	this.vertexBuffId = null;

	this.indices = null;
	this.indexBuffId = null;

	this.colors = null;
	this.colorBuffId = null;

	this.normals = null;
	this.normalBuffId = null;

	this.texture = null;
	this.textureCoords = null;
	this.textureCoordsId = null;

	this.cubeMap = null;

	this.xRot = 0;
	this.yRot = 0;
	this.zRot = 0;
	this.xPos = 0;
	this.yPos = 0;
	this.zPos = 0;

	this.showcase = true;
	this.reflective = false;
}

Model.prototype.bufferData = function() {
	// Buffer vertex data
	this.vertexBuffId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

	// Buffer index buffer if it exists
	if (this.indices != null) {
		this.indexBuffId = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffId);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
	}

	// Buffer color data if it exists
	if (this.colors != null) {
		this.colorBuffId = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffId);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);
	} else {
		// fill colors with 1.0 since they get multiplied by the texture color value ;)
		this.colorBuffId = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffId);
		this.colors = [];
		for(var i = 0; i < this.vertices.length / 3; i++) {
			this.colors.push(1.0);
			this.colors.push(1.0);
			this.colors.push(1.0);
			this.colors.push(1.0);
		}
		gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);
	}

	// If normal data exists, buffer it
	if (this.normals == null) {
		this.normals = [];
		for(var i = 0; i < this.vertices.length / 3; i++) {
			this.normals.push(0.0);
			this.normals.push(0.0);
			this.normals.push(0.0);
		}
	}
	this.normalBuffId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

	// cubemap
	if (this.cubeMap != null) {
		// if we're using a cubemap, don't do anything with textures
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
		var imgs = [];
		imgs[0] = new Image();
		imgs[0].onload = function() {
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[0]);
		}
		imgs[0].src = this.cubeMap[0];

		imgs[1] = new Image();
		imgs[1].onload = function() {
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[1]);
		}
		imgs[1].src = this.cubeMap[1];

		imgs[2] = new Image();
		imgs[2].onload = function() {
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[2]);
		}
		imgs[2].src = this.cubeMap[2];

		imgs[3] = new Image();
		imgs[3].onload = function() {
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[3]);
		}
		imgs[3].src = this.cubeMap[3];

		imgs[4] = new Image();
		imgs[4].onload = function() {
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[4]);
		}
		imgs[4].src = this.cubeMap[4];

		imgs[5] = new Image();
		imgs[5].onload = function() {
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[5]);
		}
		imgs[5].src = this.cubeMap[5];

		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

		this.cubeMap = tex;

		return;
	}

	// Buffer texture
	var tex = gl.createTexture();
	var img = new Image();
	img.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, tex);
	  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	  gl.generateMipmap(gl.TEXTURE_2D);
	  gl.bindTexture(gl.TEXTURE_2D, null);
	}

	// use a white pixel as the texture if one is not supplied
	if (this.texture != null) {
		img.src = this.texture;
		this.texture = tex;
	} else {
		img.src = "whitepixel.jpg" // white pixel for no textures
		this.texture = tex;
	}

	// since there's no tex coords defined, just create some default ones
	if (this.textureCoords == null) {
		this.textureCoords = [];
		for(var i = 0; i < this.vertices.length / 3; i++) {
			this.textureCoords.push(0.0);
			this.textureCoords.push(0.0);
		}
	}
	this.textureCoordsId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.textureCoords), gl.STATIC_DRAW);
}

Model.prototype.getMatrix = function() {
	return mult(translate(this.xPos, this.yPos, this.zPos), mult(mult(rotate(this.xRot, vec3(1, 0, 0)), rotate(this.yRot, vec3(0, 1, 0))), rotate(this.zRot, vec3(0, 0, 1))));
}

Model.prototype.drawModel = function(wireframe) {
	// rebind model vertices and color
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffId);
	gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffId);
	gl.vertexAttribPointer(aVertexColor, 4, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsId);
	gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffId);
	gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	if (this.indexBuffId != null) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffId);
	}

	// draw
	if (this.indexBuffId != null) {
		if (!wireframe)
			gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
		else
			gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_SHORT, 0);
	} else {
		if (!wireframe)
			gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
		else
			gl.drawArrays(gl.LINES, 0, this.vertices.length / 3);
	}
}

Model.prototype.drawShadows = function() {
	// renders only vertices
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffId);
	gl.vertexAttribPointer(aPositionShadow, 3, gl.FLOAT, false, 0, 0);

	if (this.indexBuffId != null) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffId);
		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
	} else {
		gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
	}
}

Model.prototype.drawSkyBox = function() {
	// draws vertices and cubemap texture
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffId);
	gl.vertexAttribPointer(aSkyPosition, 3, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubeMap);

	gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
}

Model.prototype.setTexture = function(texture, coords) {
	// set texture
	this.texture = texture;
	this.textureCoords = coords;
}

Model.prototype.setCubeMap = function(cubeMapFaces) {
	// set cubeMap
	// cubeMapFaces should be a list of files in order of:
	// right
	// left
	// top
	// bottom
	// back
	// front
	this.cubeMap = cubeMapFaces;
}

var MakeSphere = function(longitudeBands, latitudeBands, radius) {
	var vertexPositionData = [];
	var colors = [];
	var indexData = [];
	var normalData = [];
	var texCoords = [];
	for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
	    var theta = latNumber * Math.PI / latitudeBands;
	    var sinTheta = Math.sin(theta);
	    var cosTheta = Math.cos(theta);

	    for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
	        var phi = longNumber * 2 * Math.PI / longitudeBands;
	        var sinPhi = Math.sin(phi);
	        var cosPhi = Math.cos(phi);

	        var x = cosPhi * sinTheta;
	        var y = cosTheta;
	        var z = sinPhi * sinTheta;
					var u = 1 - (longNumber / longitudeBands);
        	var v = 1 - (latNumber / latitudeBands);

	        colors = [[1.0, 1.0, 0.3, 1.0]];
	        vertexPositionData.push(radius * x);
	        vertexPositionData.push(radius * y);
	        vertexPositionData.push(radius * z);
					normalData.push(x);
					normalData.push(y);
					normalData.push(z);
					texCoords.push(u);
					texCoords.push(v);
	    }
	}
	for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
		for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
			var first = (latNumber * (longitudeBands + 1)) + longNumber;
			var second = first + longitudeBands + 1;
			indexData.push(first);
			indexData.push(second);
			indexData.push(first + 1);

			indexData.push(second);
			indexData.push(second + 1);
			indexData.push(first + 1);
		}
	}

	var sphere = new Model(vertexPositionData);
	sphere.indices = indexData;
	sphere.textureCoords = texCoords;
	sphere.normals = normalData;
	sphere.colors = [];
	for(var i = 0; i < sphere.vertices.length / 3; i++) {
		sphere.colors.push(1.0);
		sphere.colors.push(1.0);
		sphere.colors.push(1.0);
		sphere.colors.push(1.0);
	}
	return sphere;
}

// Skybox!
var skybox = new Model([
	//RIGHT
	1.0, 1.0, 1.0,		// A first vertex
	1.0, -1.0, 1.0,		//A second vertex
	1.0, -1.0, -1.0,	//A third vertex
	1.0, -1.0, -1.0,	//B first vertex
	1.0, 1.0, -1.0,		//B second vertex
	1.0, 1.0, 1.0,		//B third vertex

	//LEFT
	-1.0, -1.0, -1.0,		//C first vertex
	-1.0, -1.0, 1.0,	//C second vertex
	-1.0, 1.0, 1.0,	//C third vertex
	-1.0, 1.0, 1.0,	//D first vertex
	-1.0, 1.0, -1.0,	//D second vertex
	-1.0, -1.0, -1.0,		//D third vertex

	//FRONT
	-1.0, 1.0, 1.0, 	//G first vertex
	-1.0, -1.0, 1.0,		//G second vertex
	1.0, -1.0, 1.0,		//G third vertex
	1.0, -1.0, 1.0,		//H first vertex
	1.0, 1.0, 1.0,		//H second vertex
	-1.0, 1.0, 1.0,		//H third vertex

	//BACK
	1.0, -1.0, -1.0,	//E first vertex
	-1.0, -1.0, -1.0,	//E second vertex
	-1.0, 1.0, -1.0,	//E third vertex
	-1.0, 1.0, -1.0,	//F first vertex
	1.0, 1.0, -1.0,		//F second vertex
	1.0, -1.0, -1.0,	//F third vertex

	//TOP
	-1.0, 1.0, 1.0, 	//I first vertex
	1.0, 1.0, 1.0,		//I second vertex
	1.0, 1.0, -1.0,		//I third vertex
	1.0, 1.0, -1.0,		//J first vertex
	-1.0, 1.0, -1.0,	//J second vertex
	-1.0, 1.0, 1.0,		//J third vertex

	//BOTTOM
	1.0, -1.0, -1.0, 	//K first vertex
	1.0, -1.0, 1.0,		//K second vertex
	-1.0, -1.0, 1.0,	//K third vertex
	-1.0, -1.0, 1.0,	//L first vertex
	-1.0, -1.0, -1.0,	//L second vertex
	1.0, -1.0, -1.0		//L third vertex
]);
skybox.setCubeMap([
	"right.jpg",
	"left.jpg",
	"top.jpg",
	"bottom.jpg",
	"back.jpg",
	"front.jpg"
]);

var sphere = MakeSphere(30, 30, 2);
sphere.xPos = 10;
sphere.reflective = true;

var axis = new Model([
	0.0, 0.0, -10.0,
	0.0, 0.0, 10.0,
	10.0, 0.0, 0.0,
	-10.0, 0.0, 0.0,
	0.0, 10.0, 0.0,
	0.0, -10.0, 0.0
]);
axis.colors = [
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0
];
axis.normals = [
	0.0, 0.0, -1.0,
	0.0, 0.0, 1.0,
	1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, -1.0, 0.0
];
axis.showcase = false;

var floor = new Model([
	-10.0, -2.0, 10.0,
	10.0, -2.0, 10.0,
	-10.0, -2.0, -10.0,
	-10.0, -2.0, -10.0,
	10.0, -2.0, -10.0,
	10.0, -2.0, 10.0
]);
floor.normals = [
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0
];

floor.setTexture("tiles.jpg", [
	0.0, 0.0,
	1.0, 0.0,
	0.0, 1.0,
	0.0, 1.0,
	1.0, 1.0,
	1.0, 0.0
]);
floor.showcase = false;

var cube = new Model([
	//RIGHT
	1.0, 1.0, 1.0,		// A first vertex
	1.0, -1.0, 1.0,		//A second vertex
	1.0, -1.0, -1.0,	//A third vertex
	1.0, -1.0, -1.0,	//B first vertex
	1.0, 1.0, -1.0,		//B second vertex
	1.0, 1.0, 1.0,		//B third vertex

	//LEFT
	-1.0, -1.0, -1.0,		//C first vertex
	-1.0, -1.0, 1.0,	//C second vertex
	-1.0, 1.0, 1.0,	//C third vertex
	-1.0, 1.0, 1.0,	//D first vertex
	-1.0, 1.0, -1.0,	//D second vertex
	-1.0, -1.0, -1.0,		//D third vertex

	//FRONT
	-1.0, 1.0, 1.0, 	//G first vertex
	-1.0, -1.0, 1.0,		//G second vertex
	1.0, -1.0, 1.0,		//G third vertex
	1.0, -1.0, 1.0,		//H first vertex
	1.0, 1.0, 1.0,		//H second vertex
	-1.0, 1.0, 1.0,		//H third vertex

	//BACK
	1.0, -1.0, -1.0,	//E first vertex
	-1.0, -1.0, -1.0,	//E second vertex
	-1.0, 1.0, -1.0,	//E third vertex
	-1.0, 1.0, -1.0,	//F first vertex
	1.0, 1.0, -1.0,		//F second vertex
	1.0, -1.0, -1.0,	//F third vertex

	//TOP
	-1.0, 1.0, 1.0, 	//I first vertex
	1.0, 1.0, 1.0,		//I second vertex
	1.0, 1.0, -1.0,		//I third vertex
	1.0, 1.0, -1.0,		//J first vertex
	-1.0, 1.0, -1.0,	//J second vertex
	-1.0, 1.0, 1.0,		//J third vertex

	//BOTTOM
	1.0, -1.0, -1.0, 	//K first vertex
	1.0, -1.0, 1.0,		//K second vertex
	-1.0, -1.0, 1.0,	//K third vertex
	-1.0, -1.0, 1.0,	//L first vertex
	-1.0, -1.0, -1.0,	//L second vertex
	1.0, -1.0, -1.0		//L third vertex
]);
cube.normals = [
	//RIGHT
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,

	//LEFT
	-1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0,

	//FRONT
	0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,

	//BACK
	0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,

	//TOP
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,

	//BOTTOM
	0.0, -1.0, 0.0,
	0.0, -1.0, 0.0,
	0.0, -1.0, 0.0,
	0.0, -1.0, 0.0,
	0.0, -1.0, 0.0,
	0.0, -1.0, 0.0
];/*
cube.colors = [
	1.0, 0.0, 0.0, 1.0, // front
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0, // top
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0, // left
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0, // right
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0, // back
	1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0, // bottom
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0
];*/

cube.setTexture("crate.jpg", [
	0.0, 1.0, // front
	0.0, 0.0,
	1.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 1.0, // top
	0.0, 0.0,
	1.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 1.0, // left
	0.0, 0.0,
	1.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 1.0, // right
	0.0, 0.0,
	1.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 1.0, // back
	0.0, 0.0,
	1.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 1.0, // bottom
	0.0, 0.0,
	1.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
]);
cube.zPos = 0.0;
cube.xPos = 0.0;
cube.yPos = 0.0;
cube.xRot = 20.0;
cube.yRot = 50.0;

// axis must always be the first element
// sphere should always be last
var models = [axis, floor, cube, sphere];

//CODE FROM PREVIOUS PROJECT THAT WE DO NOT NEED:

/*var pyramid = new Model([
	-1.0, -1.0, 1.0,
	0.0, 1.0, 0.0,
	1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,
	0.0, 1.0, 0.0,
	1.0, -1.0, -1.0,
	1.0, -1.0, -1.0,
	0.0, 1.0, 0.0,
	-1.0, -1.0, -1.0,
	-1.0, -1.0, -1.0,
	0.0, 1.0, 0.0,
	-1.0, -1.0, 1.0,
	-1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,
	1.0, -1.0, -1.0,
	1.0, -1.0, -1.0,
	1.0, -1.0, 1.0,
	-1.0, -1.0, 1.0
]);
pyramid.colors = [
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0
];
pyramid.zPos = -10.0;
pyramid.xPos = -5.0;
pyramid.yPos = 2.0;*/

/*1) 1.045361, 0.017499, -0.468442
2) -0.655940, 0.017499, -0.468442
3) 1.045361, 0.017499, 0.583020
4) -0.655940, 0.017499, 0.583020
5) 0.720442, 0.868150, 0.057289
6) 0.720442, -0.833152, 0.057289
7) -0.331021, 0.868150, 0.057289
8) -0.331021, -0.833152, 0.057289
9) 0.194711, 0.543230, -0.793362
10) 0.194711, 0.543230, 0.907939
11) 0.194711, -0.508232, -0.793362
12) 0.194711, -0.508232, 0.907939 */


/*var d20 = new Model([
	1.045361, 0.017499, -0.468442,
	0.194711, 0.543230, -0.793362,
	0.720442, 0.868150, 0.057289,
	-0.655940, 0.017499, -0.468442,
	0.720442, -0.833152, 0.057289,
	0.194711, -0.508232, -0.793362,
	1.045361, 0.017499, 0.583020,
	0.720442, 0.868150, 0.057289,
	0.194711, 0.543230, 0.907939,
	-0.655940, 0.017499, 0.583020,
	0.194711, -0.508232, 0.907939,
	0.720442, -0.833152, 0.057289,
	0.720442, 0.868150, 0.057289,
	-0.331021, 0.868150, 0.057289,
	0.194711, 0.543230, -0.793362,
	0.720442, -0.833152, 0.057289,
	0.194711, -0.508232, -0.793362,
	-0.331021, -0.833152, 0.057289
]);
d20.colors = [
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0
];
d20.zPos = -10.0;
d20.xPos = 5.0;
d20.yPos = 2.0;*/

/*var phone_case = new Model([
	4.0, -2.0, -5.0,	//A's first vertex
	3.5, -2.0, -5.0,	//A's second vertex
	3.5, 2.0, -5.0,		//A's third vertex
	4.0, -2.0, -5.0,	//B's first vertex
	4.0, 2.0, -5.0,		//B's second vertex
	3.5, 2.0, -5.0,		//B's third vertex
	4.0, -2.0, -5.0,	//C's first vertex
	4.0, -2.0, 5.0,		//C's second vertex
	3.5, -2.0, -5.0,	//C's third vertex
	3.5, -2.0, -5.0,	//D's first vertex
	3.5, -2.0, 5.0,		//D's second vertex
	4.0, -2.0, 5.0,		//D's third vertex
	4.0, 2.0, -5.0,		//E's first vertex
	4.0, 2.0, 5.0,		//E's second vertex
	3.5, 2.0, 5.0,		//E's third vertex
	4.0, 2.0, -5.0,		//F's first vertex
	3.5, 2.0, -5.0,		//F's second vertex
	3.5, 2.0, 5.0,		//F's third vertex
	4.0, 2.0, 5.0,		//G's first vertex
	3.5, 2.0, 5.0,		//G's second vertex
	4.0, -2.0, 5.0,		//G's third vertex
	4.0, -2.0, 5.0,		//H's first vertex
	3.5, -2.0, 5.0,		//H's second vertex
	3.5, 2.0, 5.0,		//H's third vertex
	3.5, -2.0, -5.0,	//I's first vertex
	3.5, -2.0, 5.0,		//I's second vertex
	3.5, 2.0, 5.0,		//I's third vertex
	3.5, -2.0, -5.0,	//J's first vertex
	3.5, 2.0, -5.0,		//J's second vertex
	3.5, 2.0, 5.0,		//J's third vertex

	//delete front face to make case
	/*4.0, -2.0, -5.0,	//K's first vertex
	4.0, 2.0, -5.0,		//K's second vertex
	4.0, 2.0, 5.0,		//K's third vertex
	4.0, -2.0, -5.0,	//L's first vertex
	4.0, -2.0, 5.0,		//L's second vertex
	4.0, 2.0, 5.0			//L's third vertex
]);

  phone_case.colors = [
    0.0, 1.0, 1.0, 1.0, //Red and Alpha
  	0.0, 1.0, 1.0, 1.0, //Green and Alpha
  	0.0, 1.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 1.0, 1.0, //Green and Alpha
  	0.0, 1.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Green and Alpha
  	0.0, 0.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 0.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 0.0, 1.0, 1.0, //Green and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
  	0.0, 0.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 0.0, 1.0, 1.0, //Red and Alpha
    //
    0.0, 1.0, 1.0, 1.0, //Red and Alpha
  	0.0, 1.0, 1.0, 1.0, //Green and Alpha
  	0.0, 1.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 1.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 1.0, 1.0, //Green and Alpha
  	0.0, 1.0, 1.0, 1.0, //Red and Alpha
  	0.0, 1.0, 0.0, 1.0, //Red and Alpha
  	1.0, 1.0, 0.0, 1.0, //Green and Alpha
  	0.0, 1.0, 0.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 0.0, 1.0, //Blue and Alpha
  	1.0, 1.0, 0.0, 1.0, //Green and Alpha
  	0.0, 1.0, 0.0, 1.0, //Red and Alpha
  	0.0, 1.0, 0.0, 1.0, //Red and Alpha
  	0.0, 1.0, 0.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 0.0, 1.0, //Red and Alpha
  	0.0, 1.0, 0.0, 1.0, //Red and Alpha
  	0.0, 1.0, 0.0, 1.0, //Blue and Alpha
  	0.0, 1.0, 0.0, 1.0  //Red and Alpha
];
phone_case.zPos = -20.0;
phone_case.xPos = 2.0;
phone_case.yPos = 0.0;*/

//MY FUCKING BITCH ASS FUCKING MODEL BITCHES
/*var hex = new Model([
	//A
	3.0, -1.0, 1.0,
	3.0, -2.0, 0.0,
	3.0, 1.0, 1.0,
	//B
	3.0, -2.0, 0.0,
	3.0, -1.0, -1.0,
	3.0, 1.0, 1.0,
	//C
	3.0, -1.0, -1.0,
	3.0, 1.0, -1.0,
	3.0, 1.0, 1.0,
	//D
	3.0, 1.0, -1.0,
	3.0, 2.0, 0.0,
	3.0, 1.0, 1.0,
	//E
	3.0, -1.0, 1.0,
	3.0, -2.0, 0.0,
	-3.0, -1.0, 1.0,
	//F
	-3.0, -1.0, 1.0,
	3.0, -2.0, 0.0,
	-3.0, -2.0, 0.0,
	//G
	-3.0, -2.0, 0.0,
	3.0, -2.0, 0.0,
	3.0, -1.0, -1.0,
	//H
	-3.0, -2.0, 0.0,
	3.0, -1.0, -1.0,
	-3.0, -1.0, -1.0,
	//I
	-3.0, -1.0, -1.0,
	3.0, -1.0, -1.0,
	3.0, 1.0, -1.0,
	//J
	-3.0, -1.0, -1.0,
	3.0, 1.0, -1.0,
	-3.0, 1.0, -1.0,
	//K
	-3.0, 2.0, 0.0,
	3.0, 1.0, -1.0,
	-3.0, 1.0, -1.0,
	//L
	-3.0, 2.0, 0.0,
	3.0, 2.0, 0.0,
	3.0, 1.0, -1.0,
	//M
	-3.0, 1.0, 1.0,
	3.0, 2.0, 0.0,
	-3.0, 2.0, 0.0,
	//N
	-3.0, 1.0, 1.0,
	3.0, 1.0, 1.0,
	3.0, 2.0, 0.0,
	//O
	-3.0, -1.0, 1.0,
	3.0, 1.0, 1.0,
	-3.0, 1.0, 1.0,
	//P
	-3.0, -1.0, 1.0,
	3.0, -1.0, 1.0,
	3.0, 1.0, 1.0,
	//Q
	-3.0, -1.0, 1.0,
	-3.0, -2.0, 0.0,
	-3.0, 1.0, 1.0,
	//R
	-3.0, -2.0, 0.0,
	-3.0, -1.0, -1.0,
	-3.0, 1.0, 1.0,
	//S
	-3.0, -1.0, -1.0,
	-3.0, 1.0, -1.0,
	-3.0, 1.0, 1.0,
	//T
	-3.0, 1.0, -1.0,
	-3.0, 2.0, 0.0,
	-3.0, 1.0, 1.0
]);
hex.colors = [
	//A
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	//B
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	//C
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	//D
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	//E
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	//F
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	//G
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	//H
	1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	//I
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	//J
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	//K
	1.0, 0.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	//L
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	//M
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	//N
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	//O
	0.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	//P
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	//Q
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	//R
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	//S
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	//T
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0
];
hex.zPos = -15.0;
hex.xPos = -5.0;
hex.yPos = -2.0;*/

/*var d6 = new Model([
   //Side 1
   2.0, -2.0,  2.0,
   2.0,  2.0,  2.0,
   0.0, -2.0,  2.0,
   2.0,  2.0,  2.0,
   0.0,  2.0,  2.0,
   0.0, -2.0,  2.0,

   //Side 2
   2.0, -2.0, -2.0,
   0.0, -2.0, -2.0,
   0.0,  2.0, -2.0,
   2.0, -2.0, -2.0,
   2.0,  2.0, -2.0,
   0.0,  2.0, -2.0,

   //Side 3
   2.0, -2.0, -2.0,
   2.0, -2.0,  2.0,
   0.0, -2.0,  2.0,
   2.0, -2.0, -2.0,
   0.0, -2.0, -2.0,
   0.0, -2.0,  2.0,

   //Side 4
   2.0,  2.0, -2.0,
   2.0,  2.0,  2.0,
   0.0,  2.0,  2.0,
   2.0,  2.0, -2.0,
   0.0,  2.0, -2.0,
   0.0,  2.0,  2.0,

   //Side 5
   0.0, -2.0, -2.0,
   0.0, -2.0,  2.0,
   0.0,  2.0,  2.0,
   0.0, -2.0, -2.0,
   0.0,  2.0, -2.0,
   0.0,  2.0,  2.0,

   //Side 6
   2.0, -2.0, -2.0,
   2.0, -2.0,  2.0,
   2.0,  2.0,  2.0,
   2.0, -2.0, -2.0,
   2.0,  2.0, -2.0,
   2.0,  2.0,  2.0
]);
d6.colors = [
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0,
];
d6.zPos = -10.0;
d6.xPos = 5.0;
d6.yPos = 0.0;*/
