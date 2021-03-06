declare type GL = WebGL2RenderingContext;
export declare const QUAD: number[];
export declare function createProgram(gl: GL, ...sources: string[]): WebGLProgram;
export declare function createTexture(gl: GL): WebGLTexture;
export declare function createGeometry(gl: GL, attribs: Record<string, number>, width: number, height: number): {
    position: WebGLBuffer | null;
    uv: WebGLBuffer | null;
};
export {};
