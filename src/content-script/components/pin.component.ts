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
import { DownloadBarComponent } from './download-bar/download-bar.component';
import { DrawBarComponent } from './draw-bar/draw-bar.component';
import { DrawContainerComponent } from './draw-container.component';
import { DrawToolDto } from '../../common/model/obj-draw.model';
import { PinMouseManager } from './pin-mouse.manager';
import { PinObject } from '../../common/model/pin.model';
import { PinPointFactory } from '../factory/pin-point.factory';
import { TextContainerComponent } from './text-container.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { applyStylesToElement } from '../../common/style.utils';
import { isElementHiddenFn } from '../fn/is-element-hidden.fn';
import { pinStyles } from './styles/pin.styles';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class PinComponent implements HtmlComponent<void>, PageComponent {
  readonly content = document.createElement('div');
  readonly top = document.createElement('div');
  readonly bottom = document.createElement('div');

  private readonly mouseManager: PinMouseManager;

  private readonly topBar: TopBarComponent;
  readonly text: TextContainerComponent;

  readonly drawComponent: DrawContainerComponent;
  readonly drawBar: DrawBarComponent;

  readonly downloadBar: DownloadBarComponent;

  private rect: PinRectangle;

  private refValue: HTMLElement;

  readonly object: PinObject;

  constructor(ref: HTMLElement, pin: PinObject) {
    this.refValue = ref;
    this.object = pin;
    this.rect = PinPointFactory.calculateRect(this.refValue);
    this.topBar = new TopBarComponent(this.object, this.rect, this);
    this.text = new TextContainerComponent(this.object, this.rect);

    this.mouseManager = new PinMouseManager(this, this.handleMouseOver, this.handleMouseOut);

    this.drawBar = new DrawBarComponent(this.rect, this);
    this.drawComponent = new DrawContainerComponent(this.rect, this);

    this.downloadBar = new DownloadBarComponent(this);
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
    this.text.focus(goto);
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
    this.bottom.appendChild(this.text.render());

    this.top.appendChild(this.topBar.render());

    this.top.appendChild(this.drawComponent.render());
    this.top.appendChild(this.drawBar.render());
    this.drawBar.setSize(4);
    this.drawBar.setTool(DrawToolDto.Pencil);

    this.top.appendChild(this.topBar.render());

    this.refValue.style.border = ContentSettingsStore.borderStyle;
    this.refValue.style.borderRadius = ContentSettingsStore.borderRadius;
    document.body.appendChild(this.top);
    document.body.appendChild(this.bottom);
    this.mouseManager.start();
    this.handleMouseOut();
  }

  resize(): void {
    this.rect = PinPointFactory.calculateRect(this.refValue);
    this.top.style.top = `${this.rect.y}px`;
    this.top.style.left = `${this.rect.x}px`;
    this.bottom.style.top = `${this.rect.y + this.rect.height}px`;
    this.bottom.style.left = `${this.rect.x}px`;

    this.text.resize(this.rect);
    this.topBar.resize(this.rect);
    this.drawComponent.resize(this.rect);
    this.drawBar.resize(this.rect);
  }

  cleanup(): void {
    this.refValue.style.border = this.object.border.style;
    this.refValue.style.borderRadius = this.object.border.radius;

    this.text.cleanup();
    this.topBar.cleanup();
    this.top.remove();
    this.bottom.remove();
    this.mouseManager.stop();

    this.drawComponent.cleanup();
    this.drawBar.cleanup();
  }

  private timeoutId = -1;

  private handleMouseOver = () => {
    window.clearTimeout(this.timeoutId);
    this.text.focusin();
    this.topBar.focusin();
    this.drawBar.focusin();
  };

  private handleMouseOut = () => {
    // TODO fix by creating borders top bottom left right around component
    this.timeoutId = window.setTimeout(() => {
      this.text.focusout();
      this.topBar.focusout();
      this.drawBar.focusout();
    }, 1000);
  };

  startDraw = () => {
    this.topBar.moveup();
    this.drawBar.show();
    this.drawComponent.focusin();
  };

  stopDraw = () => {
    this.topBar.movedown();
    this.drawBar.hide();
    this.drawComponent.focusout();
  };

  startDownload = () => {
    this.topBar.moveup();
    this.downloadBar.show();
  };

  stopDownload = () => {
    this.topBar.movedown();
    this.downloadBar.hide();
  };

  isHidden(): boolean {
    return isElementHiddenFn(this.refValue);
  }
}
