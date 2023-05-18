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
import { DrawAreaComponent } from './draw/draw-area.component';
import { DrawRedoButton } from './draw-bar/draw-buttons/draw-redo.button';
import { DrawToolDto } from '../../common/model/obj/obj-draw.dto';
import { DrawUndoButton } from './draw-bar/draw-buttons/draw-undo.button';

export class DrawModel {
  tool = DrawToolDto.Pencil;
  size = 4;
  color = '#ff0000';
  area?: DrawAreaComponent;

  private undoButton?: DrawUndoButton;
  private redoButton?: DrawRedoButton;

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
}
