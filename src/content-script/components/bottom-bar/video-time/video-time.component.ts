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
import { ObjVideoDataDto } from '../../../../common/model/obj/obj-snapshot.dto';
import { PinModel } from '../../pin.model';
import { XpathFactory } from '../../../../common/factory/xpath.factory';
import { applyStylesToElement } from '../../../../common/style.utils';
import { fnVideoSecondsTime } from '../../../../common/fn/date.format.fn';

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
  private el = document.createElement('div');
  private readonly video?: ObjVideoDataDto;

  constructor(private model: PinModel) {
    if (model.video) {
      this.video = model.video[0];
    }
  }

  renderVideo = () => {
    if (!this.video) return;
    this.el.innerHTML = '';
    const title = document.createElement('div');
    applyStylesToElement(title, titleStyle);
    title.innerText = 'video';
    this.el.appendChild(title);
    const from = document.createElement('div');
    from.innerText = fnVideoSecondsTime(this.video.currentTime);

    this.el.appendChild(from);

    const between = document.createElement('div');
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
    const value = XpathFactory.newXPathResult(this.video.xpath);
    const node = value.singleNodeValue as HTMLVideoElement;
    if (!node) return;
    node.currentTime = this.video.currentTime;
  };
}
