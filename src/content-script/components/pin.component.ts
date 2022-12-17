/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { ActionBarComponent } from './action-bar/action-bar.component';
import { BorderStore } from '../store/border.store';
import { EditorComponent } from './editor.component';
import { HtmlComponent } from '@common/model/html.model';
import { PinObject } from '@common/model/pin.model';
import { applyStylesToElement } from '@common/style.utils';
import { contentCalculatePinPoint } from '../fn/content-calculate-pin-point';
import { pinStyles } from './styles/pin.styles';
import PinPoint = Pinmenote.Pin.PinPoint;

export class PinComponent implements HtmlComponent {
  private el = document.createElement('div');
  private editor: EditorComponent;
  private actionbar: ActionBarComponent;
  private xy: PinPoint;
  private drag = false;

  ref: HTMLElement;
  readonly object: PinObject;

  constructor(ref: HTMLElement, pin: PinObject) {
    this.el.id = pin.uid;
    this.ref = ref;
    this.object = pin;
    this.xy = contentCalculatePinPoint(this.ref, pin.size, pin.locator.elementSize, pin.locator.offset);
    this.actionbar = new ActionBarComponent(pin, ref);
    this.editor = new EditorComponent(this.object);
  }

  focus(goto = false): void {
    this.editor.focus(goto);
  }

  get container(): HTMLElement {
    return this.el;
  }

  render(): HTMLElement {
    const styles = Object.assign(
      {
        left: `${this.xy.x}px`,
        top: `${this.xy.y}px`,
        border: BorderStore.borderStyle,
        'border-radius': BorderStore.borderRadius
      },
      pinStyles
    );

    applyStylesToElement(this.el, styles);
    this.el.appendChild(this.actionbar.render());

    this.el.appendChild(this.editor.render());

    return this.el;
  }

  startDrag(): void {
    this.drag = true;
  }

  updateDrag(value: PinPoint): void {
    const newX = this.xy.x + value.x;
    const newY = this.xy.y + value.y;
    this.el.style.left = `${newX}px`;
    this.el.style.top = `${newY}px`;
  }

  stopDrag(value: PinPoint): void {
    const { offset, elementSize } = this.object.locator;
    offset.x = offset.x + value.x;
    offset.y = offset.y + value.y;
    this.object.locator.offset = offset;
    this.xy = contentCalculatePinPoint(this.ref, this.object.size, elementSize, offset);
    this.drag = false;
  }

  get isDrag(): boolean {
    return this.drag;
  }

  resize(): void {
    const { elementSize, offset } = this.object.locator;
    this.xy = contentCalculatePinPoint(this.ref, this.object.size, elementSize, offset);
    this.el.style.left = `${this.xy.x}px`;
    this.el.style.top = `${this.xy.y}px`;
  }

  cleanup(): void {
    this.ref.style.border = this.object.border.style;
    this.ref.style.borderRadius = this.object.border.radius;
    this.actionbar.cleanup();
    this.editor.cleanup();
    this.el.remove();
  }
}
