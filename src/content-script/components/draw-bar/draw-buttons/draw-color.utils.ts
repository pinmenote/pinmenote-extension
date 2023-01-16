/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2023 Michal Szczepanski.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
export interface HSVColor {
  h: number;
  s: number;
  v: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export class ColorUtils {
  static hsvToRgb = (h: number, s: number, v: number): RGBColor => {
    h *= 6;
    const i = Math.floor(h);
    const f = h - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    const mod = i % 6;
    const r = [v, q, p, p, t, v][mod];
    const g = [t, v, v, q, p, p][mod];
    const b = [p, p, t, v, v, q][mod];

    return { r, g, b };
  };

  static rgbToHsv = (r: number, g: number, b: number): HSVColor => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    let h = 0;

    if (max == min) {
      h = 0;
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h, s, v };
  };

  static rgbToHex = (r: number, g: number, b: number): string => {
    const hex = [
      '#',
      this.pad2(Math.round(r * 255).toString(16)),
      this.pad2(Math.round(g * 255).toString(16)),
      this.pad2(Math.round(b * 255).toString(16))
    ];
    return hex.join('').toUpperCase();
  };

  static numberToRgb = (value: number): RGBColor => {
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return { r, g, b };
  };

  static stringToNumber = (value: string): number => {
    return parseInt(value.substring(1), 16);
  };

  static pad2 = (c: string): string => {
    return c.length == 1 ? '0' + c : '' + c;
  };

  static clamp = (val: number, min: number, max: number): number => {
    return Math.min(Math.max(val, min), max);
  };
}
