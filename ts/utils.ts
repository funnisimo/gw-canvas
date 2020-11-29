// Copy of: https://github.com/ondras/fastiles/blob/master/ts/utils.ts (v2.1.0)

type GL = WebGL2RenderingContext;

export const QUAD = [
	0, 0, 1, 0, 0, 1,
	0, 1, 1, 0, 1, 1
];

export function createProgram(gl: GL, ...sources: string[]) {
	const p = gl.createProgram() as WebGLProgram;

	[gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, index) => {
		const shader = gl.createShader(type) as WebGLShader;
		gl.shaderSource(shader, sources[index]);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(shader) as string); }
		gl.attachShader(p, shader);
	});

	gl.linkProgram(p);
	if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { throw new Error(gl.getProgramInfoLog(p) as string); }

	return p;
}

export function createTexture(gl: GL) {
	let t = gl.createTexture() as WebGLTexture;
	gl.bindTexture(gl.TEXTURE_2D, t);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	return t;
}

export function createGeometry(gl: GL, attribs: Record<string, number>, width: number, height: number) {
	let tileCount = width * height;
	let positionData = new Uint16Array(tileCount * QUAD.length);
	let uvData = new Uint8Array(tileCount * QUAD.length);
	let i=0;

	for (let y=0; y<height; y++) {
		for (let x=0; x<width; x++) {
			QUAD.forEach(value => {
				positionData[i] = (i % 2 ? y : x) + value;
				uvData[i] = value;
				i++;
			});
		}
	}

	const position = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, position);
	gl.vertexAttribIPointer(attribs["position"], 2, gl.UNSIGNED_SHORT, 0, 0);
	gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);

	const uv = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, uv);
	gl.vertexAttribIPointer(attribs["uv"], 2, gl.UNSIGNED_BYTE, 0, 0);
	gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.STATIC_DRAW);

	return {position, uv};
}