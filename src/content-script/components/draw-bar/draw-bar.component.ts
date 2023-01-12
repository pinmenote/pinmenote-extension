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
import { HtmlComponent, HtmlComponentFocusable } from '../../../common/model/html.model';
import { DrawBrushSizeComponent } from './draw-buttons/draw-brush-size.component';
import { DrawColorPickerComponent } from './draw-buttons/draw-color-picker.component';
import { DrawContainerComponent } from '../draw-container.component';
import { DrawEraseComponent } from './draw-buttons/draw-erase.component';
import { DrawLineComponent } from './draw-buttons/draw-line.component';
import { DrawPencilComponent } from './draw-buttons/draw-pencil.component';
import { DrawRedoComponent } from './draw-buttons/draw-redo.component';
import { DrawUndoComponent } from './draw-buttons/draw-undo.component';
import { applyStylesToElement } from '../../../common/style.utils';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import PinRectangle = Pinmenote.Pin.PinRectangle;

const drawBarStyles = {
  top: '-24px',
  height: '24px',
  position: 'absolute',
  'background-color': '#ffffff',
  display: 'none'
};

const iconStyles = {
  left: `0px`,
  position: 'absolute',
  'background-color': '#ffffff00'
};

export class DrawBarComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private visible = false;

  private readonly pencil: DrawPencilComponent;
  private readonly line: DrawLineComponent;
  private readonly erase: DrawEraseComponent;
  private readonly color: DrawColorPickerComponent;
  private readonly size: DrawBrushSizeComponent;
  private readonly undo: DrawUndoComponent;
  private readonly redo: DrawRedoComponent;

  constructor(private rect: PinRectangle, private drawContainer: DrawContainerComponent) {
    this.pencil = new DrawPencilComponent();
    this.line = new DrawLineComponent();
    this.erase = new DrawEraseComponent();

    this.color = new DrawColorPickerComponent();
    this.size = new DrawBrushSizeComponent();

    this.undo = new DrawUndoComponent();
    this.redo = new DrawRedoComponent();
  }

  focusin(): void {
    if (this.visible) this.el.style.display = 'inline-block';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  toggle(): void {
    this.visible = !this.visible;
    if (this.visible) {
      this.focusin();
    } else {
      this.focusout();
    }
  }

  cleanup(): void {
    fnConsoleLog('cleanup');
  }

  render(): HTMLElement {
    const style = Object.assign({ width: `${this.rect.width}px` }, drawBarStyles);
    applyStylesToElement(this.el, style);

    this.placeComponent(this.pencil.render(), 5);
    this.placeComponent(this.line.render(), 29);
    this.placeComponent(this.erase.render(), 53);

    this.placeComponent(this.color.render(), 97);
    this.placeComponent(this.size.render(), 121);

    this.placeComponent(this.undo.render(), 165);
    this.placeComponent(this.redo.render(), 189);

    return this.el;
  }

  private placeComponent(component: HTMLElement, x: number): void {
    this.el.appendChild(component);
    iconStyles.left = `${x}px`;
    applyStylesToElement(component, iconStyles);
  }

  resize(rect: PinRectangle): void {
    applyStylesToElement(this.el, {
      width: `${rect.width}px`
    });
  }
}
