/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { VideoTimeComponent } from './video-time/video-time.component';
import { applyStylesToElement } from '../../../common/style.utils';

const elStyles = {
  'background-color': '#ffffff',
  display: 'none',
  'flex-direction': 'row',
  'justify-content': 'space-between',
  height: '15px',
  margin: '0',
  padding: '5px 5px 5px 5px',
  'align-items': 'center'
};

export class BottomBarComponent {
  private el = document.createElement('div');

  private videoTime: VideoTimeComponent;
  private shouldDisplay = false;

  constructor(private pin: ObjPagePinDto) {
    this.videoTime = new VideoTimeComponent(pin.video);
    this.shouldDisplay = pin.video.length > 0;
  }

  render(): HTMLDivElement {
    applyStylesToElement(this.el, elStyles);

    this.el.appendChild(this.videoTime.render());

    return this.el;
  }

  cleanup(): void {
    this.videoTime.cleanup();
  }

  focusin(): void {
    if (this.shouldDisplay) this.el.style.display = 'inline-block';
  }

  focusout(): void {
    if (this.shouldDisplay) this.el.style.display = 'none';
  }
}
