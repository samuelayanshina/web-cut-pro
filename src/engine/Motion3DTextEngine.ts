import { Motion3DProps, MaterialPreset } from '../types/fcp';

/**
 * Motion 3D Text & Typography Engine
 * Replicates Apple Motion / Final Cut Pro's procedural 3D text renderer.
 * Computes 3D extrusion layers, bevel highlights, directional lighting rigs,
 * and realistic material surfaces (Brushed Metal, Chrome, Matte Gold, Neon Glass, Carbon Fiber).
 */
export class Motion3DTextEngine {
  /**
   * Render 3D Extruded Text onto a 2D Canvas context
   */
  public static render3DText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    props: {
      fontSize: number;
      fontFamily: string;
      fontWeight: string;
      color: string;
      motion3D: Motion3DProps;
    }
  ) {
    const { fontSize, fontFamily, fontWeight, color, motion3D } = props;
    const depth = Math.max(1, Math.min(100, motion3D.depth));
    const bevel = Math.max(0, Math.min(20, motion3D.bevel));
    const rotX = (motion3D.rotationX * Math.PI) / 180;
    const rotY = (motion3D.rotationY * Math.PI) / 180;
    const rotZ = (motion3D.rotationZ * Math.PI) / 180;
    const lightAngle = (motion3D.lightAngle * Math.PI) / 180;
    const lightInt = motion3D.lightIntensity;

    ctx.save();
    ctx.translate(x, y);

    // Apply 3D perspective skew/rotation
    ctx.transform(
      Math.cos(rotZ) * Math.cos(rotY),
      Math.sin(rotZ) * Math.cos(rotX) + Math.sin(rotY) * 0.1,
      -Math.sin(rotZ) * Math.cos(rotY) + Math.sin(rotX) * 0.1,
      Math.cos(rotZ) * Math.cos(rotX),
      0,
      0
    );

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Extrusion vector calculation based on pitch/yaw and lighting angle
    const stepX = Math.sin(rotY) * 0.8 + Math.cos(lightAngle) * 0.3;
    const stepY = -Math.sin(rotX) * 0.8 + Math.sin(lightAngle) * 0.3;
    const layers = Math.floor(depth / 2);

    // 1. Render Back Shadow and Extrusion Layers (from back to front)
    for (let i = layers; i >= 1; i--) {
      const offsetX = i * stepX;
      const offsetY = i * stepY;
      const progress = i / layers; // 1 = furthest back, 0 = near front

      ctx.save();
      ctx.translate(offsetX, offsetY);

      // Shaded side color: darkened by depth & light directional cosine
      const shadeFactor = Math.max(0.15, (1 - progress * 0.6) * lightInt * 0.8);
      ctx.fillStyle = this.getSideColor(color, motion3D.material, shadeFactor);
      ctx.fillText(text, 0, 0);

      // Edge stroke for bevel definition
      if (bevel > 0) {
        ctx.lineWidth = bevel * 0.5;
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.4 * progress})`;
        ctx.strokeText(text, 0, 0);
      }
      ctx.restore();
    }

    // 2. Render Front Surface Face with Material Texture/Shader
    ctx.save();
    const materialGradient = this.createMaterialStyle(
      ctx,
      motion3D.material,
      color,
      fontSize,
      lightAngle,
      lightInt,
      motion3D.specular
    );
    ctx.fillStyle = materialGradient;

    // Specular Bevel Glow
    if (motion3D.specular > 0.2) {
      ctx.shadowColor = motion3D.material === 'neonGlass' ? '#00ffff' : '#ffffff';
      ctx.shadowBlur = 8 * motion3D.specular;
    }

    ctx.fillText(text, 0, 0);

    // 3. Highlight Bevel Stroke
    if (bevel > 0) {
      ctx.lineWidth = bevel * 0.4;
      const strokeGrad = ctx.createLinearGradient(
        -fontSize * 0.5 * Math.cos(lightAngle),
        -fontSize * 0.5 * Math.sin(lightAngle),
        fontSize * 0.5 * Math.cos(lightAngle),
        fontSize * 0.5 * Math.sin(lightAngle)
      );
      strokeGrad.addColorStop(0, `rgba(255, 255, 255, ${0.8 * lightInt})`);
      strokeGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      strokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.strokeStyle = strokeGrad;
      ctx.strokeText(text, 0, 0);
    }

    ctx.restore();
    ctx.restore();
  }

  /**
   * Generates material-specific surface shaders
   */
  private static createMaterialStyle(
    ctx: CanvasRenderingContext2D,
    material: MaterialPreset,
    baseColor: string,
    fontSize: number,
    lightAngle: number,
    lightIntensity: number,
    specular: number
  ): CanvasGradient | string {
    const lx = Math.cos(lightAngle) * fontSize;
    const ly = Math.sin(lightAngle) * fontSize;

    const grad = ctx.createLinearGradient(-lx * 0.5, -ly * 0.5, lx * 0.5, ly * 0.5);

    switch (material) {
      case 'brushedMetal':
        grad.addColorStop(0, '#e0e0e0');
        grad.addColorStop(0.2, '#999999');
        grad.addColorStop(0.4, '#f5f5f5');
        grad.addColorStop(0.7, '#888888');
        grad.addColorStop(1, '#cccccc');
        return grad;

      case 'polishedChrome':
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, '#2b3948');
        grad.addColorStop(0.48, '#0b1016');
        grad.addColorStop(0.52, '#d6e5fa');
        grad.addColorStop(0.75, '#ffffff');
        grad.addColorStop(1, '#8ea2b8');
        return grad;

      case 'matteGold':
        grad.addColorStop(0, '#fff3b0');
        grad.addColorStop(0.25, '#ffd700');
        grad.addColorStop(0.6, '#b8860b');
        grad.addColorStop(0.85, '#996515');
        grad.addColorStop(1, '#ffd700');
        return grad;

      case 'neonGlass':
        grad.addColorStop(0, 'rgba(230, 255, 255, 0.95)');
        grad.addColorStop(0.3, 'rgba(0, 255, 200, 0.7)');
        grad.addColorStop(0.7, 'rgba(0, 160, 255, 0.5)');
        grad.addColorStop(1, 'rgba(255, 0, 128, 0.85)');
        return grad;

      case 'carbonFiber':
        grad.addColorStop(0, '#222222');
        grad.addColorStop(0.5, '#111111');
        grad.addColorStop(1, '#333333');
        return grad;

      case 'plastic':
      default: {
        const brightColor = this.adjustBrightness(baseColor, 1.2 * lightIntensity + specular * 0.3);
        const darkColor = this.adjustBrightness(baseColor, 0.7 * lightIntensity);
        grad.addColorStop(0, brightColor);
        grad.addColorStop(1, darkColor);
        return grad;
      }
    }
  }

  /**
   * Computes darkened/specular-shaded side colors for extrusion layers
   */
  private static getSideColor(baseColor: string, material: MaterialPreset, shadeFactor: number): string {
    if (material === 'brushedMetal' || material === 'polishedChrome') {
      const v = Math.floor(100 * shadeFactor);
      return `rgb(${v}, ${v}, ${v + 10})`;
    }
    if (material === 'matteGold') {
      const r = Math.floor(160 * shadeFactor);
      const g = Math.floor(110 * shadeFactor);
      const b = Math.floor(20 * shadeFactor);
      return `rgb(${r}, ${g}, ${b})`;
    }
    if (material === 'neonGlass') {
      return `rgba(0, 80, 120, ${shadeFactor * 0.8})`;
    }
    if (material === 'carbonFiber') {
      const v = Math.floor(40 * shadeFactor);
      return `rgb(${v}, ${v}, ${v})`;
    }
    return this.adjustBrightness(baseColor, shadeFactor);
  }

  private static adjustBrightness(hex: string, factor: number): string {
    // Basic hex/rgba brightness adjuster
    if (hex.startsWith('#')) {
      let c = hex.slice(1);
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const num = parseInt(c, 16);
      let r = (num >> 16) * factor;
      let g = ((num >> 8) & 0x00ff) * factor;
      let b = (num & 0x0000ff) * factor;
      r = Math.min(255, Math.max(0, Math.round(r)));
      g = Math.min(255, Math.max(0, Math.round(g)));
      b = Math.min(255, Math.max(0, Math.round(b)));
      return `rgb(${r}, ${g}, ${b})`;
    }
    return hex;
  }
}
