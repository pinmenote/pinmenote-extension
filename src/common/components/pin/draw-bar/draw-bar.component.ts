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
import { HtmlComponent, HtmlComponentFocusable } from '../model/pin-view.model';
import { DrawBrushSizeButton } from './draw-buttons/draw-brush-size.button';
import { DrawColorPickerButton } from './draw-buttons/draw-color-picker.button';
import { DrawEraseButton } from './draw-buttons/draw-erase.button';
import { DrawFillButton } from './draw-buttons/draw-fill.button';
import { DrawLineButton } from './draw-buttons/draw-line.button';
import { DrawPencilButton } from './draw-buttons/draw-pencil.button';
import { DrawRedoButton } from './draw-buttons/draw-redo.button';
import { DrawSaveButton } from './draw-buttons/draw-save.button';
import { DrawSaveCancelButton } from './draw-buttons/draw-save-cancel.button';
import { DrawTestButton } from './draw-buttons/draw-test.button';
import { DrawToolDto } from '../../../model/obj/obj-draw.dto';
import { DrawUndoButton } from './draw-buttons/draw-undo.button';
import { PinEditManager } from '../pin-edit.manager';
import { PinEditModel } from '../model/pin-edit.model';
import { applyStylesToElement } from '../../../style.utils';

const barStyles = {
  top: '-24px',
  height: '24px',
  position: 'absolute',
  'background-color': '#ffffff',
  display: 'none',
  'flex-direction': 'row',
  'justify-content': 'space-between'
};

const leftStyles = {
  display: 'flex',
  'flex-direction': 'row'
};

const rightStyles = {
  display: 'flex',
  'flex-direction': 'row'
};

const iconStyles = {
  left: `0px`,
  position: 'absolute',
  'background-color': '#ffffff00'
};

export class DrawBarComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el: HTMLDivElement;
  private readonly left: HTMLDivElement;
  private readonly right: HTMLDivElement;

  private visible = false;

  private readonly pencil: DrawPencilButton;
  private readonly line: DrawLineButton;
  private readonly fill: DrawFillButton;
  private readonly erase: DrawEraseButton;

  private readonly colorPicker: DrawColorPickerButton;
  private readonly sizeButton: DrawBrushSizeButton;

  private readonly undoButton: DrawUndoButton;
  private readonly redoButton: DrawRedoButton;

  private readonly drawSave: DrawSaveButton;
  private readonly drawCancel: DrawSaveCancelButton;

  private readonly drawTest: DrawTestButton;

  constructor(private edit: PinEditManager, private model: PinEditModel) {
    this.el = model.doc.document.createElement('div');
    this.left = model.doc.document.createElement('div');
    this.right = model.doc.document.createElement('div');
    this.pencil = new DrawPencilButton(this, model);
    this.line = new DrawLineButton(this, model);
    this.fill = new DrawFillButton(this, model);
    this.erase = new DrawEraseButton(this, model);

    this.colorPicker = new DrawColorPickerButton(model);
    this.sizeButton = new DrawBrushSizeButton(model);

    this.undoButton = new DrawUndoButton(this, model);
    this.redoButton = new DrawRedoButton(this, model);

    this.drawSave = new DrawSaveButton(edit, model);
    this.drawCancel = new DrawSaveCancelButton(edit, model);

    // TODO move logic to model
    this.model.draw.setUndoButton(this.undoButton);
    this.model.draw.setRedoButton(this.redoButton);

    this.drawTest = new DrawTestButton(model);
  }

  setTool(tool: DrawToolDto): void {
    switch (tool) {
      case DrawToolDto.Pencil:
        this.pencil.select();
        this.line.unselect();
        this.fill.unselect();
        this.erase.unselect();
        break;
      case DrawToolDto.Line:
        this.pencil.unselect();
        this.line.select();
        this.fill.unselect();
        this.erase.unselect();
        break;
      case DrawToolDto.Erase:
        this.pencil.unselect();
        this.line.unselect();
        this.fill.unselect();
        this.erase.select();
        break;
      case DrawToolDto.Fill:
        this.pencil.unselect();
        this.line.unselect();
        this.fill.select();
        this.erase.unselect();
        break;
    }
    this.model.draw.tool = tool;
  }

  undo(): void {
    if (!this.model.draw.area) return;
    this.model.draw.area.undo();
    if (this.model.draw.area.canUndo()) {
      this.undoButton.select();
    } else {
      this.undoButton.unselect();
    }
    if (this.model.draw.area.canRedo()) {
      this.redoButton.select();
    }
  }

  redo(): void {
    if (!this.model.draw.area) return;
    this.model.draw.area.redo();
    if (this.model.draw.area.canRedo()) {
      this.redoButton.select();
    } else {
      this.redoButton.unselect();
    }
    if (this.model.draw.area.canUndo()) {
      this.undoButton.select();
    }
  }

  setSize(value: number): void {
    this.sizeButton.setSize(value);
  }

  focusin(): void {
    if (this.visible) this.el.style.display = 'flex';
    this.colorPicker.focusin();
    this.sizeButton.focusin();
  }

  focusout(): void {
    this.el.style.display = 'none';
    this.colorPicker.focusout();
    this.sizeButton.focusout();
  }

  show(): void {
    this.visible = true;
    this.focusin();
  }

  hide(): void {
    this.visible = false;
    this.focusout();
  }

  cleanup(): void {
    this.pencil.cleanup();
    this.line.cleanup();
    this.fill.cleanup();
    this.erase.cleanup();

    this.colorPicker.cleanup();
    this.sizeButton.cleanup();

    this.undoButton.cleanup();
    this.redoButton.cleanup();

    this.drawTest.cleanup();
  }

  render(): HTMLElement {
    const style = Object.assign({ width: `${this.model.rect.width}px` }, barStyles);
    applyStylesToElement(this.el, style);
    this.el.appendChild(this.left);
    applyStylesToElement(this.left, leftStyles);

    this.el.appendChild(this.right);
    applyStylesToElement(this.right, rightStyles);

    this.left.appendChild(this.pencil.render());
    this.left.appendChild(this.line.render());
    this.left.appendChild(this.fill.render());
    this.left.appendChild(this.erase.render());

    this.left.appendChild(this.colorPicker.render());
    this.left.appendChild(this.sizeButton.render());

    this.left.appendChild(this.undoButton.render());
    this.left.appendChild(this.redoButton.render());

    this.right.appendChild(this.drawSave.render());
    this.right.appendChild(this.drawCancel.render());

    this.adjustTop();

    return this.el;
  }

  private placeComponent(component: HTMLElement, x: number): void {
    this.el.appendChild(component);
    iconStyles.left = `${x}px`;
    applyStylesToElement(component, iconStyles);
  }

  resize(): void {
    this.el.style.width = `${this.model.rect.width}px`;
    this.adjustTop();
  }

  /**
   * Element is on top of page that's why we show bar overlapping element
   * @private
   */
  private adjustTop(): void {
    if (this.model.rect.y === 0) {
      this.el.style.top = '24px';
    } else {
      this.el.style.top = '-24px';
    }
  }
}
