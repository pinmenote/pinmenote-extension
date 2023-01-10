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
import { HtmlComponent, HtmlComponentFocusable } from '../../common/model/html.model';
import { BusMessageType } from '../../common/model/bus.model';
import { DrawAreaComponent } from './draw/draw-area.component';
import { PinComponent } from './pin.component';
import { PinObject } from '../../common/model/pin.model';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { applyStylesToElement } from '../../common/style.utils';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class DrawComponent implements HtmlComponent, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private drawArea: DrawAreaComponent;

  private visible = false;
  private readonly drawKey: string;

  constructor(private object: PinObject, private rect: PinRectangle, private parent: PinComponent) {
    this.drawArea = new DrawAreaComponent(this.rect);
    this.drawKey = TinyEventDispatcher.addListener<PinObject>(BusMessageType.CNT_DRAW_CLICK, this.handleDrawIconClick);
  }

  render(): HTMLElement {
    const styles = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      display: 'none'
    };
    applyStylesToElement(this.el, styles);
    this.el.appendChild(this.drawArea.canvas);
    this.drawArea.render();

    return this.el;
  }

  private handleDrawIconClick = (event: string, key: string, value: PinObject) => {
    if (this.object.id === value.id) {
      this.visible = !this.visible;
      this.visible ? this.focusin() : this.focusout();
    }
  };

  resize(rect: PinRectangle): void {
    if (rect.width === this.rect.width && this.rect.height === rect.height) return;
    this.rect = rect;
    this.drawArea.resize(rect);
  }

  focusin(): void {
    if (this.visible) this.el.style.display = 'inline-block';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  cleanup() {
    TinyEventDispatcher.removeListener(BusMessageType.CNT_DRAW_CLICK, this.drawKey);
    this.drawArea.cleanup();
  }
}
