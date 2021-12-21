// Based on: https://github.com/ondras/fastiles/blob/master/ts/shaders.ts (v2.1.0)
export const VS = `
#version 300 es

in uvec2 position;
in uvec2 uv;
in highp uint style;

out vec2 fsUv;
flat out vec3 fgRgb;
flat out vec3 bgRgb;
flat out uvec2 fontPos;

uniform uvec2 tileSize;
uniform uvec2 viewportSize;

void main() {
	ivec2 positionPx = ivec2(position * tileSize);
	vec2 positionNdc = (vec2(positionPx * 2) / vec2(viewportSize))-1.0;
	positionNdc.y *= -1.0;
	gl_Position = vec4(positionNdc, 0.0, 1.0);

	float fr = float((style & uint(0x00000F00)) >> 8);
	float fg = float((style & uint(0x000000F0)) >> 4);
	float fb = float(style & uint(0x0000000F));
	fgRgb = vec3(fr, fg, fb) / 15.0;
  
	float br = float((style & uint(0x00F00000)) >> 20);
	float bg = float((style & uint(0x000F0000)) >> 16);
	float bb = float((style & uint(0x0000F000)) >> 12);
	bgRgb = vec3(br, bg, bb) / 15.0;

	uint glyph = (style & uint(0xFF000000)) >> 24;
	uint glyphX = (glyph & uint(0xF));
	uint glyphY = (glyph >> 4);
	fontPos = uvec2(glyphX, glyphY);

	fsUv = vec2(uv);
}`.trim();
export const FS = `
#version 300 es
precision highp float;

in vec2 fsUv;
flat in vec3 fgRgb;
flat in vec3 bgRgb;
flat in uvec2 fontPos;

out vec4 fragColor;

uniform sampler2D font;
uniform highp uvec2 tileSize;

void main() {
	uvec2 fontPx = (tileSize * fontPos) + uvec2(vec2(tileSize) * fsUv);
	vec3 texel = texelFetch(font, ivec2(fontPx), 0).rgb;

	fragColor = vec4(mix(bgRgb, fgRgb, texel), 1.0);
}`.trim();
