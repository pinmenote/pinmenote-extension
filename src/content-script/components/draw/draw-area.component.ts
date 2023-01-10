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
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class DrawAreaComponent {
  readonly canvas: HTMLCanvasElement = document.createElement('canvas');
  private readonly ctx: CanvasRenderingContext2D;

  constructor(private rect: PinRectangle) {
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('empty context');
    this.ctx = ctx;
  }

  render(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseout', this.handleMouseOut);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
  }

  resize(rect: PinRectangle): void {
    this.rect = rect;
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  cleanup(): void {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseout', this.handleMouseOut);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
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
    if (!this.ctx) return;
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
    this.ctx.beginPath();
    this.ctx.moveTo(this.prev.x, this.prev.y);
    this.ctx.lineTo(this.curr.x, this.curr.y);
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
    this.ctx.closePath();
  };
}
