"use client";

import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import React from "react";
import {
  AbsoluteFill,
  isHtmlInCanvasSupported,
  useDelayRender,
} from "remotion";

const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

const VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const LAYER: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

const OUTPUT_LAYER: React.CSSProperties = { ...LAYER, pointerEvents: "none" };

export const isCanvasTransitionSupported = (): boolean =>
  isHtmlInCanvasSupported();

export type SceneShaderFrame<Props> = {
  gl: WebGL2RenderingContext;
  uniform: (name: string) => WebGLUniformLocation | null;
  width: number;
  height: number;
  progress: number;
  passedProps: Props;
};

export type SceneShaderDrawParams<Props> = {
  from: OffscreenCanvas | null;
  to: OffscreenCanvas | null;
  width: number;
  height: number;
  progress: number;
  passedProps: Props;
};

export type SceneShaderInstance<Props> = {
  draw: (params: SceneShaderDrawParams<Props>) => void;
  clear: () => void;
  cleanup: () => void;
};

export type SceneShader<Props> = (
  canvas: OffscreenCanvas,
) => SceneShaderInstance<Props>;

function compileShader(
  gl: WebGL2RenderingContext,
  source: string,
  type: GLenum,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("canvas-presentation: failed to create shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`canvas-presentation: failed to compile shader: ${log}`);
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  fragment: string,
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw new Error("canvas-presentation: failed to create program");
  }
  const vs = compileShader(gl, VERTEX_SHADER, gl.VERTEX_SHADER);
  const fs = compileShader(gl, fragment, gl.FRAGMENT_SHADER);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`canvas-presentation: failed to link program: ${log}`);
  }
  return program;
}

function createSceneTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error("canvas-presentation: failed to create texture");
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0]),
  );
  return texture;
}

export function makeSceneShader<Props extends Record<string, unknown>>(
  fragment: string,
  setUniforms?: (frame: SceneShaderFrame<Props>) => void,
): SceneShader<Props> {
  return (canvas) => {
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true });
    if (!gl) {
      throw new Error("canvas-presentation: WebGL2 is unavailable");
    }

    const program = createProgram(gl, fragment);
    const fromTexture = createSceneTexture(gl);
    const toTexture = createSceneTexture(gl);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const locations = new Map<string, WebGLUniformLocation | null>();
    const uniform = (name: string) => {
      const cached = locations.get(name);
      if (cached !== undefined) {
        return cached;
      }
      const location = gl.getUniformLocation(program, name);
      locations.set(name, location);
      return location;
    };

    const clear = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const bindScene = (
      image: OffscreenCanvas | null,
      texture: WebGLTexture,
      unit: number,
      name: string,
    ) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (image) {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );
      }
      gl.uniform1i(uniform(name), unit);
    };

    return {
      clear,
      cleanup: () => {
        gl.deleteProgram(program);
        gl.deleteTexture(fromTexture);
        gl.deleteTexture(toTexture);
        gl.deleteBuffer(buffer);
        gl.deleteVertexArray(vao);
      },
      draw: ({ from, to, width, height, progress, passedProps }) => {
        gl.viewport(0, 0, width, height);
        clear();
        gl.useProgram(program);
        gl.bindVertexArray(vao);

        bindScene(from, fromTexture, 0, "u_from");
        bindScene(to, toTexture, 1, "u_to");

        gl.uniform1f(uniform("u_progress"), progress);
        gl.uniform1f(uniform("u_aspect"), width / height);
        setUniforms?.({ gl, uniform, width, height, progress, passedProps });

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
    };
  };
}

const transferred = new WeakMap<HTMLCanvasElement, OffscreenCanvas>();

function takeOffscreen(canvas: HTMLCanvasElement): OffscreenCanvas {
  const existing = transferred.get(canvas);
  if (existing) {
    return existing;
  }
  const created = canvas.transferControlToOffscreen();
  transferred.set(canvas, created);
  return created;
}

function makeCanvasComponent<Props extends Record<string, unknown>>(
  shader: SceneShader<Props>,
): React.FC<TransitionPresentationComponentProps<Props>> {
  return function CanvasScenePresentation({
    children,
    presentationProgress,
    presentationDirection,
    passedProps,
    onElementImage,
    onUnmount,
    bothEnteringAndExiting,
  }) {
    const layoutRef = React.useRef<HTMLCanvasElement | null>(null);
    const outputRef = React.useRef<HTMLCanvasElement | null>(null);
    const captureRef = React.useRef<OffscreenCanvas | null>(null);
    const captureContextRef =
      React.useRef<OffscreenCanvasRenderingContext2D | null>(null);
    const outputSurfaceRef = React.useRef<OffscreenCanvas | null>(null);
    const instanceRef = React.useRef<SceneShaderInstance<Props> | null>(null);
    const passedPropsRef = React.useRef(passedProps);
    passedPropsRef.current = passedProps;

    const { delayRender, continueRender } = useDelayRender();
    const passThrough =
      bothEnteringAndExiting && presentationDirection === "exiting";

    const draw = React.useCallback(
      (
        prevImage: OffscreenCanvas | null,
        nextImage: OffscreenCanvas | null,
        progress: number,
      ) => {
        const instance = instanceRef.current;
        if (!instance) {
          return;
        }
        const handle = delayRender("canvas-presentation: paint");
        const to = prevImage;
        const from = nextImage;
        const width = from?.width ?? to?.width ?? 0;
        const height = from?.height ?? to?.height ?? 0;
        if (width === 0 || height === 0) {
          instance.clear();
          continueRender(handle);
          return;
        }
        instance.draw({
          from,
          to,
          width,
          height,
          progress: !to ? 0 : !from ? 1 : progress,
          passedProps: passedPropsRef.current,
        });
        continueRender(handle);
      },
      [delayRender, continueRender],
    );

    React.useLayoutEffect(() => {
      if (passThrough) {
        return;
      }
      const layout = layoutRef.current;
      const output = outputRef.current;
      if (!layout || !output) {
        return;
      }
      const capture = takeOffscreen(layout);
      const context = capture.getContext("2d");
      if (!context) {
        throw new Error("canvas-presentation: failed to acquire a 2D context");
      }
      const surface = takeOffscreen(output);
      captureRef.current = capture;
      captureContextRef.current = context;
      outputSurfaceRef.current = surface;
      instanceRef.current = shader(surface);

      return () => {
        instanceRef.current?.cleanup();
        instanceRef.current = null;
        captureRef.current = null;
        captureContextRef.current = null;
        outputSurfaceRef.current = null;
      };
    }, [passThrough, shader]);

    React.useLayoutEffect(() => {
      if (passThrough) {
        return;
      }
      const layout = layoutRef.current;
      if (!layout) {
        return;
      }
      layout.layoutSubtree = true;
      const handlePaint = () => {
        const scene = layout.firstElementChild;
        const capture = captureRef.current;
        const context = captureContextRef.current;
        if (!scene || !capture || !context) {
          return;
        }
        const elementImage = layout.captureElementImage(scene);
        try {
          context.reset();
          context.drawElementImage(elementImage, 0, 0);
        } finally {
          elementImage.close();
        }
        onElementImage(capture, draw);
      };
      layout.addEventListener("paint", handlePaint);
      return () => layout.removeEventListener("paint", handlePaint);
    }, [passThrough, onElementImage, draw]);

    React.useLayoutEffect(() => {
      if (passThrough) {
        return;
      }
      const layout = layoutRef.current;
      if (!layout) {
        return;
      }
      const observer = new ResizeObserver(([entry]) => {
        const capture = captureRef.current;
        const surface = outputSurfaceRef.current;
        if (!capture || !surface) {
          return;
        }
        const width = entry.devicePixelContentBoxSize[0].inlineSize;
        const height = entry.devicePixelContentBoxSize[0].blockSize;
        capture.width = width;
        capture.height = height;
        surface.width = width;
        surface.height = height;
        layout.requestPaint?.();
      });
      observer.observe(layout, { box: "device-pixel-content-box" });
      return () => observer.disconnect();
    }, [passThrough]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: presentationProgress is the intentional trigger — a new progress value is what schedules the next paint
    React.useLayoutEffect(() => {
      if (passThrough) {
        return;
      }
      layoutRef.current?.requestPaint?.();
    }, [passThrough, presentationProgress]);

    React.useLayoutEffect(() => {
      if (passThrough) {
        return;
      }
      return () => onUnmount();
    }, [passThrough, onUnmount]);

    if (passThrough) {
      return <>{children}</>;
    }

    return (
      <AbsoluteFill>
        <canvas ref={layoutRef} style={LAYER}>
          {children}
        </canvas>
        <canvas ref={outputRef} style={OUTPUT_LAYER} />
      </AbsoluteFill>
    );
  };
}

export type CanvasPresentationOptions<Props extends Record<string, unknown>> = {
  shader: SceneShader<Props>;
  fallback: React.FC<TransitionPresentationComponentProps<Props>>;
};

export function makeCanvasPresentation<Props extends Record<string, unknown>>({
  shader,
  fallback: Fallback,
}: CanvasPresentationOptions<Props>): (
  props: Props,
) => TransitionPresentation<Props> {
  const Canvas = makeCanvasComponent(shader);

  const Presentation: React.FC<TransitionPresentationComponentProps<Props>> = (
    props,
  ) =>
    isCanvasTransitionSupported() ? (
      <Canvas {...props} />
    ) : (
      <Fallback {...props} />
    );

  return (props) => ({ component: Presentation, props });
}
