

// A simplified implementation of Material 3's dynamic color theming.
// This uses HSL as a proxy for HCT for simplicity.

type Scheme = Record<string, string>;
type HSLA = { h: number, s: number, l: number, a: number };
type RGBA = { r: number, g: number, b: number, a: number };


// --- Color Conversion Utilities ---

function hue2rgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}

export function hslaToRgba(hsla: HSLA): RGBA {
    const { h, s, l, a } = hsla;
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
}


export function hexToHsla(hex: string): HSLA {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0, a: 1 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    let a = result[4] ? parseInt(result[4], 16) / 255 : 1;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h, s, l, a };
}

export function hslaToHex(hsla: HSLA): string {
    const rgba = hslaToRgba(hsla);
    const toHex = (c: number) => ('0' + c.toString(16)).slice(-2);
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
}

export function hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
        ]
        : null;
}

// --- Formatting ---
export const formatRgba = (rgba: RGBA) => `RGBA (${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a.toFixed(2)})`;
export const formatHsla = (hsla: HSLA) => `HSLA (${(hsla.h * 360).toFixed(0)}, ${(hsla.s * 100).toFixed(0)}%, ${(hsla.l * 100).toFixed(0)}%, ${hsla.a.toFixed(2)})`;
export const formatHex = (hex: string) => `HEX ${hex.toUpperCase()}`;


// --- Tonal Palette Generation ---

const TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
const LIGHTNESS_MAP: Record<number, number> = Object.fromEntries(TONES.map(t => [t, t / 100]));

function generateTonalPalette(hue: number, saturation: number): Record<number, string> {
  const palette: Record<number, string> = {};
  for (const tone of TONES) {
    const l = LIGHTNESS_MAP[tone];
    palette[tone] = hslaToHex({h: hue, s: saturation, l: l, a: 1});
  }
  return palette;
}

// --- Scheme Generation ---

export function generateSchemeFromColor(sourceColorHex: string) {
  const { h, s } = hexToHsla(sourceColorHex);

  const primary = generateTonalPalette(h, s);
  const secondary = generateTonalPalette(h, s / 3);
  const tertiary = generateTonalPalette((h + 1/6) % 1, s / 1.5); // Hue shifted by 60 degrees
  const neutral = generateTonalPalette(h, s / 12);
  const neutralVariant = generateTonalPalette(h, s / 6);
  
  // Error palette is usually static (based on a red)
  const { h: errorHue, s: errorSat } = hexToHsla('#B3261E');
  const error = generateTonalPalette(errorHue, errorSat);

  const light: Scheme = {
    primary: primary[40],
    onPrimary: primary[100],
    primaryContainer: primary[90],
    onPrimaryContainer: primary[10],
    secondary: secondary[50],
    onSecondary: secondary[100],
    secondaryContainer: secondary[90],
    onSecondaryContainer: secondary[10],
    tertiary: tertiary[40],
    onTertiary: tertiary[100],
    tertiaryContainer: tertiary[90],
    onTertiaryContainer: tertiary[10],
    error: error[40],
    onError: error[100],
    errorContainer: error[90],
    onErrorContainer: error[10],
    background: neutral[99],
    onBackground: neutral[10],
    surface: neutral[99],
    onSurface: neutral[10],
    surfaceVariant: neutralVariant[90],
    onSurfaceVariant: neutralVariant[30],
    outline: neutralVariant[50],
    outlineVariant: neutralVariant[80],
    shadow: neutral[0],
    scrim: neutral[0],
    surfaceDim: neutral[87],
    surfaceBright: neutral[98],
    surfaceContainerLowest: neutral[100],
    surfaceContainerLow: neutral[96],
    surfaceContainer: neutral[94],
    surfaceContainerHigh: neutral[92],
    surfaceContainerHighest: neutral[90],
  };

  const dark: Scheme = {
    primary: primary[80],
    onPrimary: primary[20],
    primaryContainer: primary[30],
    onPrimaryContainer: primary[90],
    secondary: secondary[80],
    onSecondary: secondary[20],
    secondaryContainer: secondary[30],
    onSecondaryContainer: secondary[90],
    tertiary: tertiary[80],
    onTertiary: tertiary[20],
    tertiaryContainer: tertiary[30],
    onTertiaryContainer: tertiary[90],
    error: error[80],
    onError: error[20],
    errorContainer: error[30],
    onErrorContainer: error[90],
    background: neutral[10],
    onBackground: neutral[90],
    surface: neutral[10],
    onSurface: neutral[90],
    surfaceVariant: neutralVariant[30],
    onSurfaceVariant: neutralVariant[80],
    outline: neutralVariant[60],
    outlineVariant: neutralVariant[30],
    shadow: neutral[0],
    scrim: neutral[0],
    surfaceDim: neutral[6],
    surfaceBright: neutral[24],
    surfaceContainerLowest: neutral[4],
    surfaceContainerLow: neutral[10],
    surfaceContainer: neutral[12],
    surfaceContainerHigh: neutral[17],
    surfaceContainerHighest: neutral[22],
  };

  return { light, dark };
}