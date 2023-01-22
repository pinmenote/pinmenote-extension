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
import { DownloadCsvButton } from './download-buttons/download-csv.button';
import { DownloadImageButton } from './download-buttons/download-image.button';
import { HtmlComponent } from '../../../common/model/html.model';
import { PinComponent } from '../pin.component';
import { applyStylesToElement } from '../../../common/style.utils';
import PinRectangle = Pinmenote.Pin.PinRectangle;

const downloadBarStyles = {
  top: '-24px',
  height: '24px',
  position: 'absolute',
  'background-color': '#ffffff',
  display: 'none',
  'font-size': '20px',
  'justify-content': 'right',
  'align-items': 'center',
  color: '#000000'
};

export class DownloadBarComponent implements HtmlComponent<HTMLElement> {
  private readonly el = document.createElement('div');

  private visible = false;

  private imageButton: DownloadImageButton;
  private csvButton: DownloadCsvButton;

  constructor(private parent: PinComponent, private rect: PinRectangle) {
    this.imageButton = new DownloadImageButton(parent);
    this.csvButton = new DownloadCsvButton(parent);
  }

  show(): void {
    this.visible = true;
    this.focusin();
  }

  hide(): void {
    this.visible = false;
    this.focusout();
  }

  focusin(): void {
    if (this.visible) this.el.style.display = 'flex';
    if (this.csvButton.visible()) this.csvButton.show();
  }

  focusout(): void {
    this.el.style.display = 'none';
    this.csvButton.hide();
  }

  render(): HTMLElement {
    const style = Object.assign({ width: `${this.rect.width}px` }, downloadBarStyles);
    applyStylesToElement(this.el, style);

    this.el.appendChild(this.csvButton.render());
    this.el.appendChild(this.imageButton.render());

    this.adjustTop();

    return this.el;
  }

  resize(rect: PinRectangle): void {
    this.rect = rect;
    this.el.style.width = `${rect.width}px`;
    this.adjustTop();
  }

  cleanup() {
    this.csvButton.cleanup();
    this.imageButton.cleanup();
  }

  private adjustTop(): void {
    if (this.rect.y === 0) {
      this.el.style.top = '24px';
    } else {
      this.el.style.top = '-24px';
    }
  }
}
