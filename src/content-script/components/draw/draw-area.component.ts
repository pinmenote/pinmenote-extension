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
import { DrawToolDto, ObjDrawDataDto } from '../../../common/model/obj-draw.model';
import { ObjPointDto, ObjRectangleDto } from '../../../common/model/obj-utils.model';
import { EraserDraw } from './tool/eraser.draw';
import { FillDraw } from './tool/fill.draw';
import { LineDraw } from './tool/line.draw';
import { PencilDraw } from './tool/pencil.draw';
import { PinComponent } from '../pin.component';
import { PinUpdateCommand } from '../../../common/command/pin/pin-update.command';
import { applyStylesToElement } from '../../../common/style.utils';

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

  private tool = DrawToolDto.Pencil;
  private size = 4;
  private color = '#ff0000';

  private drawing = false;
  private drawData: ObjDrawDataDto[] = [];
  private drawRedoData: ObjDrawDataDto[] = [];

  constructor(private parent: PinComponent, private rect: ObjRectangleDto) {
    this.drawCtx = this.drawCanvas.getContext('2d');
    this.rasterCtx = this.rasterCanvas.getContext('2d');
    if (parent.object.data.draw.length > 0) {
      const draw = parent.object.data.draw[0];
      this.drawData = draw.data;
      this.initDrawCanvas(draw.size.width, draw.size.height);
      this.initRasterCanvas(draw.size.width, draw.size.height);
      for (let i = 0; i < this.drawData.length; i++) {
        this.drawOne(this.drawData[i]);
      }
    } else {
      const width = Math.min(rect.width, window.innerWidth);
      const height = Math.min(rect.height, window.innerHeight);
      this.initDrawCanvas(width, height);
      this.initRasterCanvas(width, height);
    }
  }

  private initRasterCanvas(width: number, height: number): void {
    this.rasterCanvas.width = width;
    this.rasterCanvas.height = height;
    this.rasterCanvas.style.width = `${width}px`;
    this.rasterCanvas.style.height = `${height}px`;
    applyStylesToElement(this.rasterCanvas, canvasStyles);

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

  async undo(): Promise<boolean> {
    if (!this.rasterCtx) return false;
    const data = this.drawData.pop();
    if (data) {
      this.drawRedoData.push(data);
      this.rasterCtx.clearRect(0, 0, this.rasterCanvas.width, this.rasterCanvas.height);
      for (let i = 0; i < this.drawData.length; i++) {
        this.drawOne(this.drawData[i]);
      }
      await this.saveOrUpdateDraw();
      return true;
    }
    return false;
  }

  async redo(): Promise<boolean> {
    const data = this.drawRedoData.pop();
    if (data) {
      this.drawData.push(data);
      this.drawOne(data);
      await this.saveOrUpdateDraw();
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

  resize(rect: ObjRectangleDto): void {
    // TODO scale image based on size ?
    this.rect = rect;
  }

  cleanup(): void {
    this.drawCanvas.removeEventListener('mousedown', this.handleMouseDown);
    this.drawCanvas.removeEventListener('mouseup', this.handleMouseUp);
    this.drawCanvas.removeEventListener('mouseout', this.handleMouseUp);
    this.drawCanvas.removeEventListener('mousemove', this.handleMouseMove);
  }

  private handleMouseUp = async (e: MouseEvent): Promise<void> => {
    if (!this.drawing) return;
    if (!this.drawCtx || !this.rasterCtx) return;
    this.drawing = false;

    // we can undo
    this.parent.drawBar.undoSelect();

    // show back raster canvas
    this.rasterCanvas.style.display = 'inline-block';
    let points: ObjPointDto[] = [];
    switch (this.tool) {
      case DrawToolDto.Pencil:
        points = PencilDraw.stopDraw();
        PencilDraw.raster(points, this.color, this.size, this.rasterCtx);
        break;
      case DrawToolDto.Line:
        points = LineDraw.stopDraw();
        LineDraw.raster(points, this.color, this.size, this.rasterCtx);
        break;
      case DrawToolDto.Erase:
        points = EraserDraw.stopDraw(this.drawCtx);
        EraserDraw.raster(points, this.size, this.rasterCtx);
        break;
      case DrawToolDto.Fill:
        points = FillDraw.fill({ x: e.offsetX, y: e.offsetY }, this.color, this.drawCtx);
        FillDraw.raster(points, this.color, this.rasterCtx);
        break;
    }
    // clear draw canvas
    this.drawCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    this.drawData.push({
      tool: this.tool,
      size: this.size,
      color: this.color,
      points
    });
    await this.saveOrUpdateDraw();
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.drawCtx || !this.drawing) return;
    switch (this.tool) {
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
    if (!this.drawCtx || !this.rasterCtx) return;
    this.drawing = true;
    // cleanup redo
    this.drawRedoData = [];
    this.parent.drawBar.redoUnselect();

    // set draw data from draw bar
    this.tool = this.parent.drawBar.tool();
    this.size = this.parent.drawBar.size();
    this.color = this.parent.drawBar.color();

    // draw from raster to draw and hide raster canvas
    this.drawCtx.drawImage(this.rasterCanvas, 0, 0);
    this.rasterCanvas.style.display = 'none';

    switch (this.tool) {
      case DrawToolDto.Pencil:
        PencilDraw.startDraw({ x: e.offsetX, y: e.offsetY }, this.color, this.size, this.drawCtx);
        break;
      case DrawToolDto.Line:
        LineDraw.startDraw({ x: e.offsetX, y: e.offsetY }, this.color, this.size, this.drawCtx);
        break;
      case DrawToolDto.Erase:
        EraserDraw.startDraw({ x: e.offsetX, y: e.offsetY }, this.size, this.drawCtx);
        break;
    }
  };

  private saveOrUpdateDraw = async () => {
    if (this.parent.object.data.draw.length === 0) {
      this.parent.object.data.draw.push({
        data: this.drawData,
        size: {
          width: this.rasterCanvas.width,
          height: this.rasterCanvas.height
        }
      });
      await new PinUpdateCommand(this.parent.object).execute();
    } else {
      this.parent.object.data.draw[0].data = this.drawData;
      await new PinUpdateCommand(this.parent.object).execute();
    }
  };
}
