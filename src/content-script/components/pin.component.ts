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
import { HtmlComponent, PageComponent } from '../../common/model/html.model';
import { ContentSettingsStore } from '../store/content-settings.store';
import { PinObject } from '../../common/model/pin.model';
import { PinPointFactory } from '../factory/pin-point.factory';
import { TextEditorComponent } from './text-editor.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { applyStylesToElement } from '../../common/style.utils';
import { pinStyles } from './styles/pin.styles';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class PinComponent implements HtmlComponent, PageComponent {
  private readonly el = document.createElement('div');
  private readonly topBar: TopBarComponent;
  private readonly textEditor: TextEditorComponent;

  private rect: PinRectangle;

  private refValue: HTMLElement;

  readonly object: PinObject;

  constructor(ref: HTMLElement, pin: PinObject) {
    this.el.id = pin.uid;
    this.refValue = ref;
    this.object = pin;
    this.rect = PinPointFactory.calculateRect(this.refValue);
    this.topBar = new TopBarComponent(this.rect, this.object, this);
    this.textEditor = new TextEditorComponent(this.object, this.rect);
  }

  setNewRef(ref: HTMLElement): void {
    this.refValue.style.border = this.object.border.style;
    this.refValue.style.borderRadius = this.object.border.radius;
    this.refValue = ref;
  }

  get ref(): HTMLElement {
    return this.refValue;
  }

  focus(goto = false): void {
    this.textEditor.focus(goto);
  }

  render(): HTMLElement {
    const styles = Object.assign(
      {
        left: `${this.rect.x}px`,
        top: `${this.rect.y}px`,
        width: `${this.rect.width}px`,
        height: `${this.rect.height}px`
      },
      pinStyles
    );

    applyStylesToElement(this.el, styles);
    this.el.appendChild(this.textEditor.render());

    this.el.appendChild(this.topBar.render());

    this.refValue.style.border = ContentSettingsStore.borderStyle;
    this.refValue.style.borderRadius = ContentSettingsStore.borderRadius;

    this.el.addEventListener('mouseover', this.handleMouseOver);
    this.el.addEventListener('mouseout', this.handleMouseOut);

    return this.el;
  }

  resize(): void {
    this.rect = PinPointFactory.calculateRect(this.refValue);
    this.el.style.left = `${this.rect.x}px`;
    this.el.style.top = `${this.rect.y}px`;
    this.el.style.width = `${this.rect.width}px`;
    this.el.style.height = `${this.rect.height}px`;
    this.textEditor.resize(this.rect);
    this.topBar.resize(this.rect);
  }

  cleanup(): void {
    this.el.removeEventListener('mouseover', this.handleMouseOver);
    this.el.removeEventListener('mouseout', this.handleMouseOut);

    this.refValue.style.border = this.object.border.style;
    this.refValue.style.borderRadius = this.object.border.radius;

    this.textEditor.cleanup();
    this.topBar.cleanup();
    this.el.remove();
  }

  private handleMouseOver = () => {
    this.textEditor.focusin();
    this.topBar.focusin();
  };

  private handleMouseOut = () => {
    this.textEditor.focusout();
    this.topBar.focusout();
  };
}
