// Based on: https://github.com/ondras/fastiles/blob/master/ts/shaders.ts (v2.1.0)
export const VS = `
#version 300 es

in vec2 position;
in uvec2 offset;
in uint fg;
in uint bg;
in uint glyph;

out vec2 fsOffset;
out vec3 fgRgb;
out vec3 bgRgb;
flat out uvec2 fontPos;

uniform uvec2 tileSize;

void main() {
	gl_Position = vec4(position, 0.0, 1.0);

	float fgr = float((fg & uint(0xF00)) >> 8);
	float fgg = float((fg & uint(0x0F0)) >> 4);
	float fgb = float(fg & uint(0x00F));
	fgRgb = vec3(fgr, fgg, fgb) / 15.0;
  
	float bgr = float((bg & uint(0xF00)) >> 8);
	float bgg = float((bg & uint(0x0F0)) >> 4);
	float bgb = float((bg & uint(0x00F)));
	bgRgb = vec3(bgr, bgg, bgb) / 15.0;

	//uint glyph = (style & uint(0xFF000000)) >> 24;
	uint glyphX = (glyph & uint(0xF));
	uint glyphY = (glyph >> 4);
	fontPos = uvec2(glyphX, glyphY);

	fsOffset = vec2(offset);
}`.trim();
export const FS = `
#version 300 es
precision highp float;

in vec2 fsOffset;
in vec3 fgRgb;
in vec3 bgRgb;
flat in uvec2 fontPos;

out vec4 fragColor;

uniform sampler2D font;
uniform highp uvec2 tileSize;

void main() {
	uvec2 fontPx = (tileSize * fontPos) + uvec2(vec2(tileSize) * fsOffset);
	vec3 texel = texelFetch(font, ivec2(fontPx), 0).rgb;

	fragColor = vec4(mix(bgRgb, fgRgb, texel), 1.0);
}`.trim();
