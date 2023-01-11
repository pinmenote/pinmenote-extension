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
import { DrawComponent } from './draw.component';
import { PinMouseManager } from './pin-mouse.manager';
import { PinObject } from '../../common/model/pin.model';
import { PinPointFactory } from '../factory/pin-point.factory';
import { TextEditorComponent } from './text-editor.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { applyStylesToElement } from '../../common/style.utils';
import { pinStyles } from './styles/pin.styles';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class PinComponent implements HtmlComponent, PageComponent {
  readonly content = document.createElement('div');
  readonly top = document.createElement('div');
  readonly bottom = document.createElement('div');

  private readonly mouseManager: PinMouseManager;

  private readonly topBar: TopBarComponent;
  private readonly textEditor: TextEditorComponent;

  private readonly drawComponent: DrawComponent;

  private rect: PinRectangle;

  private refValue: HTMLElement;

  readonly object: PinObject;

  constructor(ref: HTMLElement, pin: PinObject) {
    this.refValue = ref;
    this.object = pin;
    this.rect = PinPointFactory.calculateRect(this.refValue);
    this.topBar = new TopBarComponent(this.object, this.rect, this);
    this.textEditor = new TextEditorComponent(this.object, this.rect);
    this.drawComponent = new DrawComponent(this.object, this.rect, this);
    this.mouseManager = new PinMouseManager(this, this.handleMouseOver, this.handleMouseOut);
  }

  setNewRef(ref: HTMLElement): void {
    this.mouseManager.stop();
    this.refValue.style.border = this.object.border.style;
    this.refValue.style.borderRadius = this.object.border.radius;
    this.refValue.removeEventListener('mouseover', this.handleMouseOver);
    this.refValue.removeEventListener('mouseout', this.handleMouseOut);
    this.refValue = ref;
    this.mouseManager.start();
  }

  get ref(): HTMLElement {
    return this.refValue;
  }

  focus(goto = false): void {
    this.textEditor.focus(goto);
  }

  render(): void {
    const bottomStyles = Object.assign(
      {
        left: `${this.rect.x}px`,
        top: `${this.rect.y + this.rect.height}px`
      },
      pinStyles
    );
    const topStyles = Object.assign(
      {
        left: `${this.rect.x}px`,
        top: `${this.rect.y}px`
      },
      pinStyles
    );
    applyStylesToElement(this.bottom, bottomStyles);
    applyStylesToElement(this.top, topStyles);
    this.bottom.appendChild(this.textEditor.render());

    this.top.appendChild(this.topBar.render());

    this.top.appendChild(this.drawComponent.render());

    this.refValue.style.border = ContentSettingsStore.borderStyle;
    this.refValue.style.borderRadius = ContentSettingsStore.borderRadius;
    document.body.appendChild(this.top);
    document.body.appendChild(this.bottom);
    this.mouseManager.start();
  }

  resize(): void {
    this.rect = PinPointFactory.calculateRect(this.refValue);
    this.top.style.top = `${this.rect.y}px`;
    this.top.style.left = `${this.rect.x}px`;
    this.bottom.style.top = `${this.rect.y + this.rect.height}px`;
    this.bottom.style.left = `${this.rect.x}px`;
    this.textEditor.resize(this.rect);
    this.topBar.resize(this.rect);
    this.drawComponent.resize(this.rect);
  }

  cleanup(): void {
    this.refValue.style.border = this.object.border.style;
    this.refValue.style.borderRadius = this.object.border.radius;

    this.textEditor.cleanup();
    this.topBar.cleanup();
    this.top.remove();
    this.bottom.remove();
    this.mouseManager.stop();
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
