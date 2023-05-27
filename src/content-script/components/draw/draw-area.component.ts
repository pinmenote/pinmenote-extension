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
import { DrawToolDto, ObjDrawDataDto } from '../../../common/model/obj/obj-draw.dto';
import { EraserDraw } from './tool/eraser.draw';
import { FillDraw } from './tool/fill.draw';
import { LineDraw } from './tool/line.draw';
import { ObjPointDto } from '../../../common/model/obj/obj-utils.dto';
import { PencilDraw } from './tool/pencil.draw';
import { PinModel } from '../pin.model';
import { applyStylesToElement } from '../../../common/style.utils';
import { fnConsoleLog } from '../../../common/fn/fn-console';

const canvasStyles = {
  position: 'absolute',
  top: '0px',
  left: '0px'
};

export class DrawAreaComponent {
  readonly rasterCanvas: HTMLCanvasElement = document.createElement('canvas');
  readonly drawCanvas: HTMLCanvasElement = document.createElement('canvas');
  private readonly drawCtx: CanvasRenderingContext2D | null;
  private readonly rasterCtx: CanvasRenderingContext2D | null;

  canDraw = false;
  private drawing = false;
  private readonly drawData: ObjDrawDataDto[] = [];
  private drawRedoData: ObjDrawDataDto[] = [];

  constructor(private model: PinModel) {
    this.drawCtx = this.drawCanvas.getContext('2d');
    this.rasterCtx = this.rasterCanvas.getContext('2d');
    if (!model.drawData) {
      const width = Math.min(model.rect.width, window.innerWidth);
      const height = Math.min(model.rect.height, window.innerHeight);
      model.draw.addDraw(width, height);
    }
    this.drawData = model.drawData.data.concat();
    this.initDrawCanvas(model.drawData.size.width, model.drawData.size.height);
    this.initRasterCanvas(model.drawData.size.width, model.drawData.size.height);
    for (let i = 0; i < model.drawData.data.length; i++) {
      this.drawOne(model.drawData.data[i]);
    }
  }

  private initRasterCanvas(width: number, height: number): void {
    this.rasterCanvas.width = width;
    this.rasterCanvas.height = height;
    this.rasterCanvas.style.width = `${width}px`;
    this.rasterCanvas.style.height = `${height}px`;
    applyStylesToElement(this.rasterCanvas, canvasStyles);

    /*if (this.parent.object.data.html.screenshot) {
      const img = new Image();
      img.src = this.parent.object.data.html.screenshot;
      img.addEventListener('load', () => {
        this.rasterCtx?.drawImage(img, 0, 0);
      });
    }*/

    if (this.rasterCtx) this.rasterCtx.imageSmoothingEnabled = false;
  }

  private initDrawCanvas(width: number, height: number): void {
    this.drawCanvas.width = width;
    this.drawCanvas.height = height;
    this.drawCanvas.style.width = `${width}px`;
    this.drawCanvas.style.height = `${height}px`;
    applyStylesToElement(this.drawCanvas, canvasStyles);
    this.drawCanvas.innerHTML = `<h1 style="background-color: #ffffff;color: #000000;font-size:4em;">
no javascript enabled - drawing not working</h1>`;
    if (this.drawCtx) this.drawCtx.imageSmoothingEnabled = false;
  }

  canUndo(): boolean {
    return this.drawData.length > 0;
  }

  canRedo(): boolean {
    return this.drawRedoData.length > 0;
  }

  undo(): boolean {
    if (!this.rasterCtx) return false;
    const data = this.drawData.pop();
    if (data) {
      this.drawRedoData.push(data);
      this.rasterCtx.clearRect(0, 0, this.rasterCanvas.width, this.rasterCanvas.height);
      for (let i = 0; i < this.drawData.length; i++) {
        this.drawOne(this.drawData[i]);
      }
      this.model.draw.updateDraw(this.drawData);
      return true;
    }
    return false;
  }

  redo(): boolean {
    const data = this.drawRedoData.pop();
    if (data) {
      this.drawData.push(data);
      this.drawOne(data);
      this.model.draw.updateDraw(this.drawData);
      return true;
    }
    return false;
  }

  private drawOne(data: ObjDrawDataDto): void {
    if (!this.rasterCtx) return;
    if (data) {
      switch (data.tool) {
        case DrawToolDto.Pencil:
          PencilDraw.raster(data.points, data.color, data.size, this.rasterCtx);
          break;
        case DrawToolDto.Line:
          LineDraw.raster(data.points, data.color, data.size, this.rasterCtx);
          break;
        case DrawToolDto.Erase:
          EraserDraw.raster(data.points, data.size, this.rasterCtx);
          break;
        case DrawToolDto.Fill:
          FillDraw.raster(data.points, data.color, this.rasterCtx);
          break;
      }
    }
  }

  render(): void {
    this.drawCanvas.addEventListener('mousedown', this.handleMouseDown);
    this.drawCanvas.addEventListener('mouseup', this.handleMouseUp);
    this.drawCanvas.addEventListener('mouseout', this.handleMouseUp);
    this.drawCanvas.addEventListener('mousemove', this.handleMouseMove);
  }

  resize(): void {
    // TODO scale image based on size ?
    fnConsoleLog('scale image based on size');
  }

  cleanup(): void {
    this.drawCanvas.removeEventListener('mousedown', this.handleMouseDown);
    this.drawCanvas.removeEventListener('mouseup', this.handleMouseUp);
    this.drawCanvas.removeEventListener('mouseout', this.handleMouseUp);
    this.drawCanvas.removeEventListener('mousemove', this.handleMouseMove);
  }

  private handleMouseUp = (e: MouseEvent): void => {
    if (!this.canDraw) return;
    if (!this.drawing) return;
    if (!this.drawCtx || !this.rasterCtx) return;
    this.drawing = false;

    // we can undo
    this.model.draw.undoSelect();

    // show back raster canvas
    this.rasterCanvas.style.display = 'inline-block';
    let points: ObjPointDto[] = [];
    switch (this.model.draw.tool) {
      case DrawToolDto.Pencil:
        points = PencilDraw.stopDraw();
        PencilDraw.raster(points, this.model.draw.color, this.model.draw.size, this.rasterCtx);
        break;
      case DrawToolDto.Line:
        points = LineDraw.stopDraw();
        LineDraw.raster(points, this.model.draw.color, this.model.draw.size, this.rasterCtx);
        break;
      case DrawToolDto.Erase:
        points = EraserDraw.stopDraw(this.drawCtx);
        EraserDraw.raster(points, this.model.draw.size, this.rasterCtx);
        break;
      case DrawToolDto.Fill:
        points = FillDraw.fill({ x: e.offsetX, y: e.offsetY }, this.model.draw.color, this.drawCtx);
        FillDraw.raster(points, this.model.draw.color, this.rasterCtx);
        break;
    }
    // clear draw canvas
    this.drawCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    this.drawData.push({
      tool: this.model.draw.tool,
      size: this.model.draw.size,
      color: this.model.draw.color,
      points
    });
    this.model.draw.updateDraw(this.drawData);
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.canDraw) return;
    if (!this.drawCtx || !this.drawing) return;
    switch (this.model.draw.tool) {
      case DrawToolDto.Pencil:
        PencilDraw.draw({ x: e.offsetX, y: e.offsetY }, this.drawCtx);
        break;
      case DrawToolDto.Line:
        this.drawCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        this.drawCtx.drawImage(this.rasterCanvas, 0, 0);
        LineDraw.draw({ x: e.offsetX, y: e.offsetY }, this.drawCtx);
        break;
      case DrawToolDto.Erase:
        EraserDraw.draw({ x: e.offsetX, y: e.offsetY }, this.drawCtx);
        break;
    }
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (!this.canDraw) return;
    if (!this.drawCtx || !this.rasterCtx) return;
    this.drawing = true;
    // cleanup redo
    this.drawRedoData = [];
    this.model.draw.redoUnselect();

    // draw from raster to draw and hide raster canvas
    this.drawCtx.drawImage(this.rasterCanvas, 0, 0);
    this.rasterCanvas.style.display = 'none';

    switch (this.model.draw.tool) {
      case DrawToolDto.Pencil:
        PencilDraw.startDraw({ x: e.offsetX, y: e.offsetY }, this.model.draw.color, this.model.draw.size, this.drawCtx);
        break;
      case DrawToolDto.Line:
        LineDraw.startDraw({ x: e.offsetX, y: e.offsetY }, this.model.draw.color, this.model.draw.size, this.drawCtx);
        break;
      case DrawToolDto.Erase:
        EraserDraw.startDraw({ x: e.offsetX, y: e.offsetY }, this.model.draw.size, this.drawCtx);
        break;
    }
  };
}
