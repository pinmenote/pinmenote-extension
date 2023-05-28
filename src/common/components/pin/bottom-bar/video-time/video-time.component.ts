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
import { ObjVideoDataDto } from '../../../../model/obj/obj-snapshot.dto';
import { PinEditModel } from '../../model/pin-edit.model';
import { XpathFactory } from '../../../../factory/xpath.factory';
import { applyStylesToElement } from '../../../../style.utils';
import { fnVideoSecondsTime } from '../../../../fn/fn-date-format';

const elStyles = {
  display: 'flex',
  'flex-direction': 'row',
  padding: '0',
  margin: '0',
  'user-select': 'none',
  cursor: 'pointer'
};

const titleStyle = {
  'font-weight': 'bold',
  'margin-right': '5px'
};

export class VideoTimeComponent {
  private readonly el: HTMLDivElement;
  private readonly video?: ObjVideoDataDto;

  constructor(private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
    if (model.video) this.video = model.video;
  }

  renderVideo = () => {
    if (!this.video) return;
    this.el.innerHTML = '';
    const title = this.model.doc.document.createElement('div');
    applyStylesToElement(title, titleStyle);
    title.innerText = 'video';
    this.el.appendChild(title);
    const from = this.model.doc.document.createElement('div');
    from.innerText = fnVideoSecondsTime(this.video.time[0].currentTime);

    this.el.appendChild(from);

    const between = this.model.doc.document.createElement('div');
    between.innerText = '-';
    this.el.appendChild(between);
  };

  render(): HTMLDivElement {
    applyStylesToElement(this.el, elStyles);

    this.el.addEventListener('click', this.handleNavigateClick);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleNavigateClick);
  }

  private handleNavigateClick = () => {
    if (!this.video) return;
    const value = XpathFactory.newXPathResult(document, this.video.xpath);
    const node = value.singleNodeValue as HTMLVideoElement;
    if (!node) return;
    node.currentTime = this.video.time[0].currentTime;
  };
}
