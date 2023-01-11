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
import { DrawToolDto, ObjDrawDto } from '../../../common/model/obj-draw.model';
import { ObjPoint } from '../../../common/model/obj-utils.model';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class DrawComponent {
  readonly canvas: HTMLCanvasElement = document.createElement('canvas');
  private readonly ctx: CanvasRenderingContext2D | null;

  private currentPoints: ObjPoint[] = [];
  private currentTool = DrawToolDto.Pencil;
  private currentToolSize = 4;
  private currentColor = '#ff0000';
  private lineCap: CanvasLineCap = 'square';
  private lineJoin: CanvasLineJoin = 'round';

  private drawData: ObjDrawDto[] = [];

  constructor(private rect: PinRectangle) {
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    const ctx = this.canvas.getContext('2d');
    this.canvas.innerText = 'no javascript enabled - drawing not working';
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
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
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
    this.appendData();
  };

  private handleMouseOut = (e: MouseEvent) => {
    this.drawing = false;
    this.appendData();
  };

  private appendData(): void {
    this.drawData.push({
      points: this.currentPoints.slice(0),
      size: this.currentToolSize,
      color: this.currentColor,
      tool: this.currentTool,
      brush: {
        lineCap: this.lineCap,
        lineJoin: this.lineJoin
      }
    });
  }

  private handleMouseMove = (e: MouseEvent) => {
    this.prev = { x: this.curr.x, y: this.curr.y };
    this.curr = { x: e.offsetX, y: e.offsetY };
    this.draw();
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (!this.ctx) return;
    this.prev = { ...this.curr };
    this.curr.x = e.offsetX;
    this.curr.y = e.offsetY;
    this.currentPoints.push(this.curr);
    this.drawing = true;
    this.draw();
  };

  private draw = (): void => {
    if (!this.drawing || !this.ctx) return;
    this.ctx.beginPath();
    this.ctx.moveTo(this.prev.x, this.prev.y);
    this.ctx.lineTo(this.curr.x, this.curr.y);
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentToolSize;
    this.ctx.lineCap = this.lineCap;
    this.ctx.lineJoin = this.lineJoin;
    this.ctx.stroke();
    this.ctx.closePath();
    this.currentPoints.push(this.curr);
  };
}
