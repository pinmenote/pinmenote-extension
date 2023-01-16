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
import { ColorUtils, RGBColor } from './draw-color.utils';
import { DrawColorPickerButton } from './draw-color-picker.button';
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
  border: '1px solid black',
  position: 'absolute',
  width: '4px',
  height: '4px',
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
  'user-select': 'none',
  'pointer-events': 'none'
};

const colorInputStyles = {
  position: 'absolute',
  width: '200px',
  height: '25px',
  top: '175px',
  left: '0px',
  outline: 'none',
  'font-size': '1em',
  'background-color': '#ffffff',
  color: '#000000',
  border: '2px solid #000000'
};

export class DrawColorPicker implements HtmlComponent<HTMLElement> {
  private readonly el = document.createElement('div');
  private readonly saturation = document.createElement('div');
  private readonly saturationSelector = document.createElement('div');
  private saturationMove = false;

  private readonly brightness = document.createElement('div');

  private readonly hue = document.createElement('div');
  private readonly hueSelector = document.createElement('div');
  private hueMove = false;

  private colorInput = document.createElement('input');

  private color: RGBColor = { r: 255, g: 0, b: 0 };

  constructor(private rect: PinRectangle, private colorDisplay: DrawColorPickerButton) {}

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

    applyStylesToElement(this.colorInput, colorInputStyles);
    this.el.appendChild(this.colorInput);
    this.colorInput.addEventListener('input', this.handleInput);

    applyStylesToElement(this.el, elStyles);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('mousedown', this.handleDown);
    this.el.removeEventListener('mousemove', this.handleMove);
    this.el.removeEventListener('mouseup', this.handleUp);
    this.colorInput.removeEventListener('input', this.handleInput);
  }

  show(): void {
    this.el.style.top = '0px';
    this.el.style.display = 'inline-block';
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  hexColor(): string {
    return ColorUtils.rgbToHex(this.color.r, this.color.g, this.color.b);
  }

  setColor(hex: string, updateInput = true): void {
    if (updateInput) this.colorInput.value = hex;
    const rgb = ColorUtils.stringToRgb(hex);
    const hsv = ColorUtils.rgbToHsv(rgb.r, rgb.g, rgb.b);
    this.updateHue((1 - hsv.h) * 175, false);
    this.updateSaturation(175 * hsv.s, (1 - hsv.v) * 175, false);
  }

  private handleInput = () => {
    this.setColor(this.colorInput.value, false);
  };

  private handleDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
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
    if (this.saturationMove && this.hueMove) return;
    if (this.saturationMove && e.offsetX < 170) {
      this.updateSaturation(e.offsetX, e.offsetY);
    }
    if (this.hueMove && e.offsetX > 175) {
      this.updateHue(e.offsetY);
    }
  };

  private updateHue(value: number, updateInput = true): void {
    const top = ColorUtils.clamp(value, 0, 175);
    this.hueSelector.style.top = `${top}px`;
    const hsv = ColorUtils.rgbToHsv(this.color.r, this.color.g, this.color.b);
    hsv.h = 1 - top / 175;
    this.color = ColorUtils.hsvToRgb(hsv.h, hsv.s, hsv.v);
    this.saturation.style.background = `linear-gradient(to right, #ffffff, ${ColorUtils.rgbToHex(
      this.color.r,
      this.color.g,
      this.color.b
    )})`;
    const hex = this.hexColor();
    this.colorDisplay.updateColor(hex);
    if (updateInput) this.colorInput.value = hex;
  }

  private updateSaturation(x: number, y: number, updateInput = true) {
    const left = ColorUtils.clamp(x - 2, 0, 175);
    const top = ColorUtils.clamp(y - 2, 0, 175);
    this.saturationSelector.style.top = `${top}px`;
    this.saturationSelector.style.left = `${left}px`;
    const hsv = ColorUtils.rgbToHsv(this.color.r, this.color.g, this.color.b);
    hsv.s = left / 175;
    hsv.v = 1 - top / 175;
    this.color = ColorUtils.hsvToRgb(hsv.h, hsv.s, hsv.v);
    const hex = this.hexColor();
    this.colorDisplay.updateColor(hex);
    if (updateInput) this.colorInput.value = hex;
  }

  private handleUp = () => {
    this.saturationMove = false;
    this.hueMove = false;
  };
}
