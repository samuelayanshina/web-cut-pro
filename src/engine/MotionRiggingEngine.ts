import { MotionRigProps, MotionRigParameter } from '../types/fcp';

/**
 * Apple Motion Parameter Rigging Engine
 * In Apple Motion & Final Cut Pro, Parameter Rigs bundle multiple animation variables
 * (such as tracking speed, lower-third accent bar width, glow radius, glitch frequency)
 * into customizable control panels (Sliders, Checkboxes, Popups) exposed in the Inspector.
 */
export class MotionRiggingEngine {
  /**
   * Default Motion Title Templates with rigged controls
   */
  public static getPresetTemplates(): { name: string; template: MotionRigProps }[] {
    return [
      {
        name: 'Kinetic Lower Third 3D',
        template: {
          enabled: true,
          templateName: 'Kinetic Lower Third 3D',
          parameters: [
            { id: 'barWidth', name: 'Accent Bar Width', type: 'slider', value: 380, min: 100, max: 800 },
            { id: 'glowIntensity', name: 'Neon Glow Intensity', type: 'slider', value: 0.8, min: 0, max: 2 },
            { id: 'showSubtitle', name: 'Show Role / Subtitle', type: 'toggle', value: true },
            { id: 'themeColor', name: 'Motion Theme', type: 'popup', value: 'Electric Cyan', options: ['Electric Cyan', 'FCP Gold', 'Sunset Magenta', 'Monochrome'] }
          ]
        }
      },
      {
        name: 'Cinematic 3D Title Sequence',
        template: {
          enabled: true,
          templateName: 'Cinematic 3D Title Sequence',
          parameters: [
            { id: 'cameraDolly', name: 'Camera Dolly In', type: 'slider', value: 1.25, min: 1, max: 2 },
            { id: 'extrusionDepth', name: '3D Extrusion Depth', type: 'slider', value: 35, min: 5, max: 80 },
            { id: 'lensFlare', name: 'Anamorphic Lens Flare', type: 'toggle', value: true },
            { id: 'surfaceFinish', name: 'Finish Material', type: 'popup', value: 'Brushed Titanium', options: ['Brushed Titanium', 'Gold Leaf', 'Polished Chrome', 'Obsidian'] }
          ]
        }
      },
      {
        name: 'Broadcast Split Lower Third',
        template: {
          enabled: true,
          templateName: 'Broadcast Split Lower Third',
          parameters: [
            { id: 'splitRatio', name: 'Split Divider Pos', type: 'slider', value: 50, min: 20, max: 80 },
            { id: 'liveBadge', name: 'Show "LIVE" Indicator', type: 'toggle', value: false },
            { id: 'motionSpeed', name: 'Wipe In Duration (s)', type: 'slider', value: 0.4, min: 0.1, max: 1.5 }
          ]
        }
      }
    ];
  }

  /**
   * Evaluates parameter rig values at a specific progress time
   */
  public static getRigValue<T>(rig: MotionRigProps | undefined, parameterId: string, defaultValue: T): T {
    if (!rig || !rig.enabled) return defaultValue;
    const param = rig.parameters.find(p => p.id === parameterId);
    return param ? (param.value as T) : defaultValue;
  }

  /**
   * Update a parameter value in a rig
   */
  public static updateRigParameter(rig: MotionRigProps, parameterId: string, newValue: number | boolean | string): MotionRigProps {
    return {
      ...rig,
      parameters: rig.parameters.map(p => (p.id === parameterId ? { ...p, value: newValue } : p))
    };
  }
}
