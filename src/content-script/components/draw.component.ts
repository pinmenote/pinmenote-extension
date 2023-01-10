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
import { PinComponent } from './pin.component';
import { PinObject } from '../../common/model/pin.model';
import { TinyEventDispatcher } from '../../common/service/tiny.event.dispatcher';
import { applyStylesToElement } from '../../common/style.utils';
import { fnConsoleLog } from '../../common/fn/console.fn';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class DrawComponent implements HtmlComponent, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private readonly canvas: HTMLCanvasElement = document.createElement('canvas');
  private readonly ctx: CanvasRenderingContext2D | null;

  private visible = false;
  private readonly drawKey: string;

  constructor(private object: PinObject, private rect: PinRectangle, private parent: PinComponent) {
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.ctx = this.canvas.getContext('2d');
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
    this.el.appendChild(this.canvas);

    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseout', this.handleMouseOut);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);

    return this.el;
  }

  private curr = {
    x: 0,
    y: 0
  };

  private prev = {
    x: 0,
    y: 0
  };

  private drawing = false;

  private handleMouseUp = (e: MouseEvent) => {
    this.drawing = false;
  };

  private handleMouseOut = (e: MouseEvent) => {
    this.drawing = false;
  };

  private handleMouseMove = (e: MouseEvent) => {
    this.prev = { ...this.curr };
    this.curr.x = e.offsetX;
    this.curr.y = e.offsetY;
    this.draw();
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (!this.ctx || !this.visible) return;
    this.prev = { ...this.curr };
    this.curr.x = e.offsetX;
    this.curr.y = e.offsetY;
    this.ctx.beginPath();
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(this.curr.x, this.curr.y, 4, 4);
    this.ctx.closePath();
    this.drawing = true;
  };

  private draw = (): void => {
    if (!this.drawing) return;
    if (!this.ctx) return;
    this.ctx.beginPath();
    this.ctx.moveTo(this.prev.x, this.prev.y);
    this.ctx.lineTo(this.curr.x, this.curr.y);
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
    this.ctx.closePath();
  };

  private handleDrawIconClick = (event: string, key: string, value: PinObject) => {
    if (this.object.id === value.id) {
      this.visible = !this.visible;
      this.visible ? this.focusin() : this.focusout();
    }
  };

  resize(rect: PinRectangle): void {
    if (rect.width === this.rect.width && this.rect.height === rect.height) return;
    this.rect = rect;
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  focusin(): void {
    if (this.visible) this.el.style.display = 'inline-block';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  cleanup() {
    fnConsoleLog('cleanup');
    TinyEventDispatcher.removeListener(BusMessageType.CNT_DRAW_CLICK, this.drawKey);
  }
}
