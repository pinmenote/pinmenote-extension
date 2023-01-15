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
import { DrawColorPickerComponent } from './draw-color-picker.component';
import { HtmlComponent } from '../../../../common/model/html.model';
import { applyStylesToElement } from '../../../../common/style.utils';
import PinRectangle = Pinmenote.Pin.PinRectangle;

const saturationStyles = {
  background: 'linear-gradient(to right, #FFFFFF, #FF0000)',
  position: 'absolute',
  width: '175px',
  height: '175px',
  'user-select': 'none',
  'pointer-events': 'none'
};

const brightnessStyles = {
  background: 'linear-gradient(rgba(255, 255, 255, 0), rgba(0, 0, 0, 1))',
  position: 'absolute',
  width: '175px',
  height: '175px',
  'user-select': 'none',
  'pointer-events': 'none'
};

const hueStyles = {
  /* eslint-disable max-len */
  background:
    'linear-gradient(rgb(255, 0, 0) 0%, rgb(255, 0, 255) 17%, rgb(0, 0, 255) 34%, rgb(0, 255, 255) 50%, rgb(0, 255, 0) 67%, rgb(255, 255, 0) 84%, rgb(255, 0, 0) 100%)',
  position: 'absolute',
  left: '175px',
  width: '25px',
  height: '175px',
  'user-select': 'none',
  'pointer-events': 'none'
};

const elStyles = {
  width: '200px',
  height: '200px',
  display: 'none',
  position: 'absolute'
};

const brightnessSelectorStyles = {
  border: '2px solid black',
  position: 'absolute',
  width: '4px',
  height: '4px',
  'border-radius': '5px',
  top: '0px',
  left: '0px',
  'user-select': 'none',
  'pointer-events': 'none'
};

const hueSelectorStyles = {
  position: 'absolute',
  background: 'white',
  border: '1px solid black',
  width: '25px',
  height: '2px',
  left: '174px',
  top: '0px',
  'user-select': 'none'
};

interface HSVColor {
  h: number;
  s: number;
  v: number;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export class DrawColorPicker implements HtmlComponent<HTMLElement> {
  private readonly el = document.createElement('div');
  private readonly saturation = document.createElement('div');
  private readonly saturationSelector = document.createElement('div');
  private saturationMove = false;

  private readonly brightness = document.createElement('div');

  private readonly hue = document.createElement('div');
  private readonly hueSelector = document.createElement('div');
  private hueMove = false;

  private color: HSVColor = { h: 0, s: 1, v: 1 };

  constructor(private rect: PinRectangle, private colorDisplay: DrawColorPickerComponent) {}

  render(): HTMLElement {
    applyStylesToElement(this.saturation, saturationStyles);
    applyStylesToElement(this.brightness, brightnessStyles);
    applyStylesToElement(this.saturationSelector, brightnessSelectorStyles);

    applyStylesToElement(this.hue, hueStyles);
    applyStylesToElement(this.hueSelector, hueSelectorStyles);

    this.el.addEventListener('mousedown', this.handleDown);
    this.el.addEventListener('mousemove', this.handleMove);
    this.el.addEventListener('mouseup', this.handleUp);

    this.el.appendChild(this.saturation);
    this.el.appendChild(this.brightness);
    this.el.appendChild(this.saturationSelector);
    this.el.appendChild(this.hue);
    this.el.appendChild(this.hueSelector);

    applyStylesToElement(this.el, elStyles);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('mousedown', this.handleDown);
    this.el.removeEventListener('mousemove', this.handleMove);
    this.el.removeEventListener('mouseup', this.handleUp);
  }

  show(): void {
    this.el.style.top = '0px';
    this.el.style.display = 'inline-block';
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  hexColor(): string {
    const rgb = hsvToRgb(this.color.h, this.color.s, this.color.v);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  setColor(hex: string): void {
    const value = parseInt(hex.substring(1), 16);
    const rgb = numberToRgb(value);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    this.updateHue((1 - hsv.h) * 175);
    this.updateSaturation(175 * hsv.s, (1 - hsv.v) * 175);
  }

  private handleDown = (e: MouseEvent) => {
    if (e.offsetX < 175 && e.offsetY < 175) {
      this.saturationMove = true;
      this.updateSaturation(e.offsetX, e.offsetY);
    } else if (e.offsetY < 175) {
      this.hueMove = true;
      this.updateHue(e.offsetY);
    }
  };

  private handleMove = (e: MouseEvent) => {
    if (!this.saturationMove && !this.hueMove) return;
    if (this.saturationMove && e.offsetX < 170) {
      this.updateSaturation(e.offsetX, e.offsetY);
    }
    if (this.hueMove && e.offsetX > 175) {
      this.updateHue(e.offsetY);
    }
  };

  private updateHue(value: number): void {
    const top = clamp(value - 2, 0, 175);
    this.hueSelector.style.top = `${top}px`;
    this.color.h = 1 - top / 175;
    const hueColor = hsvToRgb(this.color.h, 1, 1);
    this.saturation.style.background = `linear-gradient(to right, #ffffff, ${rgbToHex(
      hueColor.r,
      hueColor.g,
      hueColor.b
    )})`;
    this.colorDisplay.updateColor(this.hexColor());
  }

  private updateSaturation(x: number, y: number) {
    const left = clamp(x - 6, 0, 175);
    const top = clamp(y - 6, 0, 175);
    this.saturationSelector.style.top = `${top}px`;
    this.saturationSelector.style.left = `${left}px`;
    this.color.s = left / 175;
    this.color.v = 1 - top / 175;
    this.colorDisplay.updateColor(this.hexColor());
  }

  private handleUp = () => {
    this.saturationMove = false;
    this.hueMove = false;
  };
}

const hsvToRgb = (h: number, s: number, v: number): RGBColor => {
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

const rgbToHsv = (r: number, g: number, b: number): HSVColor => {
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

const rgbToHex = (r: number, g: number, b: number): string => {
  const hex = [
    '#',
    pad2(Math.round(r * 255).toString(16)),
    pad2(Math.round(g * 255).toString(16)),
    pad2(Math.round(b * 255).toString(16))
  ];
  return hex.join('').toUpperCase();
};

const numberToRgb = (value: number): RGBColor => {
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  return { r, g, b };
};

const pad2 = (c: string): string => {
  return c.length == 1 ? '0' + c : '' + c;
};

const clamp = (val: number, min: number, max: number): number => {
  return Math.min(Math.max(val, min), max);
};
