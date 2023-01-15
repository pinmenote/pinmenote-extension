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
import { PencilDraw } from './tool/pencil.draw';
import { PinComponent } from '../pin.component';
import { applyStylesToElement } from '../../../common/style.utils';
import PinRectangle = Pinmenote.Pin.PinRectangle;

const canvasStyles = {
  position: 'absolute',
  top: '0px',
  left: '0px'
};

export class DrawComponent {
  readonly rasterCanvas: HTMLCanvasElement = document.createElement('canvas');
  readonly drawCanvas: HTMLCanvasElement = document.createElement('canvas');
  private readonly drawCtx: CanvasRenderingContext2D | null;
  private readonly rasterCtx: CanvasRenderingContext2D | null;

  private toolSize = 4;

  private drawing = false;

  constructor(private rect: PinRectangle, private parent: PinComponent) {
    this.drawCanvas.width = rect.width;
    this.drawCanvas.height = rect.height;
    this.drawCanvas.style.width = `${rect.width}px`;
    this.drawCanvas.style.height = `${rect.height}px`;
    applyStylesToElement(this.drawCanvas, canvasStyles);
    this.drawCanvas.innerText = 'no javascript enabled - drawing not working';
    this.drawCtx = this.drawCanvas.getContext('2d');

    this.rasterCanvas.width = rect.width;
    this.rasterCanvas.height = rect.height;
    this.rasterCanvas.style.width = `${rect.width}px`;
    this.rasterCanvas.style.height = `${rect.height}px`;
    applyStylesToElement(this.rasterCanvas, canvasStyles);
    this.rasterCanvas.innerText = 'no javascript enabled - drawing not working';
    this.rasterCtx = this.rasterCanvas.getContext('2d');
  }

  render(): void {
    this.drawCanvas.addEventListener('mousedown', this.handleMouseDown);
    this.drawCanvas.addEventListener('mouseup', this.handleMouseUp);
    this.drawCanvas.addEventListener('mouseout', this.handleMouseUp);
    this.drawCanvas.addEventListener('mousemove', this.handleMouseMove);
  }

  resize(rect: PinRectangle): void {
    this.rect = rect;
    this.drawCanvas.width = rect.width;
    this.drawCanvas.height = rect.height;
    this.drawCanvas.style.width = `${rect.width}px`;
    this.drawCanvas.style.height = `${rect.height}px`;
    this.rasterCanvas.width = rect.width;
    this.rasterCanvas.height = rect.height;
    this.rasterCanvas.style.width = `${rect.width}px`;
    this.rasterCanvas.style.height = `${rect.height}px`;
  }

  cleanup(): void {
    this.drawCanvas.removeEventListener('mousedown', this.handleMouseDown);
    this.drawCanvas.removeEventListener('mouseup', this.handleMouseUp);
    this.drawCanvas.removeEventListener('mouseout', this.handleMouseUp);
    this.drawCanvas.removeEventListener('mousemove', this.handleMouseMove);
  }

  private handleMouseUp = () => {
    if (!this.drawing) return;
    const points = PencilDraw.stopDraw();
    this.drawing = false;
    if (!this.drawCtx || !this.rasterCtx) return;
    this.drawCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    PencilDraw.raster(points, this.parent.drawBar.color(), this.toolSize, this.rasterCtx);
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.drawCtx || !this.drawing) return;
    PencilDraw.draw({ x: e.offsetX, y: e.offsetY }, this.drawCtx);
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (!this.drawCtx) return;
    this.drawing = true;
    PencilDraw.startDraw({ x: e.offsetX, y: e.offsetY }, this.parent.drawBar.color(), this.toolSize, this.drawCtx);
  };
}
