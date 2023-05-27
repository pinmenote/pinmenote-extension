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
import { HtmlComponent } from '../../model/pin-view.model';
import { PinEditModel } from '../../model/pin-edit.model';
import { applyStylesToElement } from '../../../../style.utils';
import { iconButtonStyles } from '../../styles/icon-button.styles';

export class DrawTestButton implements HtmlComponent<HTMLElement> {
  private readonly el: HTMLDivElement;

  constructor(private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
  }

  render(): HTMLElement {
    this.el.innerText = 'test';
    this.el.style.color = '#000000';
    this.el.addEventListener('click', this.handleClick);
    applyStylesToElement(this.el, iconButtonStyles);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  private handleClick = () => {
    if (!this.model.draw.area) return;
    const can = this.model.draw.area.rasterCanvas;
    const ctx = can.getContext('2d');
    if (!ctx) return;
    const pixelData = ctx.getImageData(0, 0, can.width, can.height).data;
    if (pixelData.length % 4 !== 0) alert('problem % 4');
    let r = 0,
      g = 0,
      b = 0;
    const tol = 10;
    for (let i = 0; i < pixelData.length; i += 4) {
      r = pixelData[i];
      g = pixelData[i + 1];
      b = pixelData[i + 2];
      if (r - g > tol && r - b > tol) {
        pixelData[i] = 255;
        pixelData[i + 1] = 0;
        pixelData[i + 2] = 0;
        pixelData[i + 3] = 255;
      } else if (g - r > tol && g - b > tol) {
        pixelData[i] = 0;
        pixelData[i + 1] = 255;
        pixelData[i + 2] = 0;
        pixelData[i + 3] = 255;
      } else if (b - r > tol && b - g > tol) {
        pixelData[i] = 0;
        pixelData[i + 1] = 0;
        pixelData[i + 2] = 255;
        pixelData[i + 3] = 255;
      } else if (r - b > tol && g - b > tol) {
        pixelData[i] = 255;
        pixelData[i + 1] = 255;
        pixelData[i + 2] = 0;
        pixelData[i + 3] = 255;
      } else {
        pixelData[i] = 0;
        pixelData[i + 1] = 0;
        pixelData[i + 2] = 0;
        pixelData[i + 3] = 255;
      }
    }
    const imData = new ImageData(pixelData, can.width, can.height);
    ctx.putImageData(imData, 0, 0);
  };
}
