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
    if (s === 0) {
      return { r: Math.round(v * 255), g: Math.round(v * 255), b: Math.round(v * 255) };
    }
    h *= 6;
    const i = Math.floor(h);
    const f = h - i;
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));
    const mod = i % 6;
    let r = 0;
    let g = 0;
    let b = 0;
    if (mod == 0) {
      r = v;
      g = t;
      b = p;
    } else if (mod == 1) {
      r = q;
      g = v;
      b = p;
    } else if (mod == 2) {
      r = p;
      g = v;
      b = t;
    } else if (mod == 3) {
      r = p;
      g = q;
      b = v;
    } else if (mod == 4) {
      r = t;
      g = p;
      b = v;
    } else if (mod == 5) {
      r = v;
      g = p;
      b = q;
    }
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);
    return { r, g, b };
  };

  static rgbToHsv = (r: number, g: number, b: number): HSVColor => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const range = max - min;
    const v = max;
    if (max === min) {
      return { h: 0, s: 0, v };
    }
    const s = max === 0 ? 0 : range / max;
    const rc = (max - r) / range;
    const gc = (max - g) / range;
    const bc = (max - b) / range;
    let h = 0;
    if (r == max) {
      h = bc - gc;
    } else if (g == max) {
      h = 2 + rc - bc;
    } else {
      h = 4 + gc - rc;
    }
    h = (h / 6) % 1;
    return { h, s, v };
  };

  static rgbToHex = (r: number, g: number, b: number): string => {
    const hex = [
      '#',
      this.pad2(Math.round(r).toString(16)),
      this.pad2(Math.round(g).toString(16)),
      this.pad2(Math.round(b).toString(16))
    ];
    return hex.join('').toUpperCase();
  };

  static stringToRgb = (value: string): RGBColor => {
    return {
      r: parseInt(value.substring(1, 3), 16),
      g: parseInt(value.substring(3, 5), 16),
      b: parseInt(value.substring(5, 7), 16)
    };
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
