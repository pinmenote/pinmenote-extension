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
import { DrawToolDto, ObjDrawDataDto, ObjDrawDto } from '../../common/model/obj/obj-draw.dto';
import { DrawAreaComponent } from './draw/draw-area.component';
import { DrawRedoButton } from './draw-bar/draw-buttons/draw-redo.button';
import { DrawUndoButton } from './draw-bar/draw-buttons/draw-undo.button';
import { ObjDrawListDto } from '../../common/model/obj/obj-pin.dto';
import { PinModel } from './pin.model';
import { PinUpdateCommand } from '../../common/command/pin/pin-update.command';
import { fnSha256 } from '../../common/fn/fn-sha256';

export class DrawModel {
  tool = DrawToolDto.Pencil;
  size = 4;
  color = '#ff0000';
  area?: DrawAreaComponent;

  private draw: ObjDrawListDto;

  private undoButton?: DrawUndoButton;
  private redoButton?: DrawRedoButton;

  constructor(draw: ObjDrawListDto) {
    this.draw = draw;
  }

  get data(): ObjDrawDto {
    return this.draw.data[0];
  }

  undoSelect() {
    this.undoButton?.select();
  }

  redoUnselect() {
    this.redoButton?.unselect();
  }

  setUndoButton(value: DrawUndoButton) {
    this.undoButton = value;
  }

  setRedoButton(value: DrawRedoButton) {
    this.redoButton = value;
  }

  setDrawArea(value: DrawAreaComponent) {
    this.area = value;
  }

  addDraw(width: number, height: number) {
    this.draw.data.push({
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: [],
      size: { width, height },
      hash: ''
    });
  }

  updateDraw(data: ObjDrawDataDto[]) {
    this.draw.data[0].data = data;
  }

  async saveDraw(model: PinModel) {
    this.draw.data[0].hash = fnSha256(JSON.stringify(this.draw.data[0].data));
    await new PinUpdateCommand(model.object).execute();
  }
}
