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
import { PinEditBarComponent } from './pin-edit-bar/pin-edit-bar.component';
import { PinMouseManager } from './pin-mouse.manager';
import { PinObject } from '../../common/model/pin.model';
import { PinPointFactory } from '../factory/pin-point.factory';
import { TextContainerComponent } from './text/text-container.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { applyStylesToElement } from '../../common/style.utils';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { isElementHiddenFn } from '../fn/is-element-hidden.fn';
import { pinStyles } from './styles/pin.styles';
import PinRectangle = Pinmenote.Pin.PinRectangle;

enum VisibleBar {
  None = 1,
  DrawBar,
  EditBar,
  DownloadBar
}

export class PinComponent implements HtmlComponent<void>, PageComponent {
  readonly content = document.createElement('div');
  readonly top = document.createElement('div');
  readonly bottom = document.createElement('div');

  private readonly mouseManager: PinMouseManager;

  private readonly topBar: TopBarComponent;
  private readonly text: TextContainerComponent;

  readonly drawComponent: DrawContainerComponent;
  readonly drawBar: DrawBarComponent;

  readonly downloadBar: DownloadBarComponent;

  readonly editBar: PinEditBarComponent;

  private rect: PinRectangle;

  private refValue: HTMLElement;

  readonly object: PinObject;

  constructor(ref: HTMLElement, pin: PinObject) {
    this.refValue = ref;
    this.object = pin;
    this.rect = PinPointFactory.calculateRect(this.refValue);
    this.topBar = new TopBarComponent(this, this.object, this.rect);
    this.text = new TextContainerComponent(this.object, this.rect);

    this.mouseManager = new PinMouseManager(this, this.handleMouseOver, this.handleMouseOut);

    this.drawBar = new DrawBarComponent(this, this.rect);
    this.drawComponent = new DrawContainerComponent(this, this.rect);

    this.downloadBar = new DownloadBarComponent(this, this.rect);

    this.editBar = new PinEditBarComponent(this, this.rect);
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

    // Draw
    this.top.appendChild(this.drawComponent.render());
    this.top.appendChild(this.drawBar.render());
    this.drawBar.setSize(4);
    this.drawBar.setTool(DrawToolDto.Pencil);

    // Download
    this.top.appendChild(this.downloadBar.render());

    // Edit
    this.top.appendChild(this.editBar.render());

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
    this.downloadBar.resize(this.rect);
    this.editBar.resize(this.rect);
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
    this.editBar.cleanup();
  }

  private timeoutId = -1;

  private handleMouseOver = () => {
    window.clearTimeout(this.timeoutId);
    this.text.focusin();
    this.topBar.focusin();
    this.drawBar.focusin();
    this.downloadBar.focusin();
  };

  private handleMouseOut = () => {
    // TODO fix by creating borders top bottom left right around component
    this.timeoutId = window.setTimeout(() => {
      this.text.focusout();
      this.topBar.focusout();
      this.drawBar.focusout();
      this.downloadBar.focusout();
    }, 1000);
  };

  startDraw = () => {
    this.changeVisibleBar(VisibleBar.DrawBar);
  };

  stopDraw = () => {
    this.changeVisibleBar(VisibleBar.None);
  };

  startDownload = () => {
    this.changeVisibleBar(VisibleBar.DownloadBar);
  };

  stopDownload = () => {
    this.changeVisibleBar(VisibleBar.None);
  };

  startEdit = () => {
    this.changeVisibleBar(VisibleBar.EditBar);
  };

  stopEdit = () => {
    this.changeVisibleBar(VisibleBar.None);
  };

  showText = () => {
    this.text.show();
  };

  hideText = () => {
    this.text.hide();
  };

  isHidden(): boolean {
    return isElementHiddenFn(this.refValue);
  }

  private changeVisibleBar(bar: VisibleBar) {
    fnConsoleLog('PinComponent->changeVisibleBar', bar);
    switch (bar) {
      case VisibleBar.None:
        this.topBar.movedown();

        this.downloadBar.hide();

        this.editBar.hide();

        this.drawBar.hide();
        this.drawComponent.focusout();
        break;
      case VisibleBar.EditBar:
        this.topBar.moveup();

        // Draw cleanup
        this.drawBar.hide();
        this.topBar.drawTurnoff();

        // Download cleanup
        this.downloadBar.hide();
        this.topBar.downloadTurnoff();

        this.editBar.show();
        break;
      case VisibleBar.DrawBar:
        this.topBar.moveup();

        // Download cleanup
        this.downloadBar.hide();
        this.topBar.downloadTurnoff();

        // Edit cleanup
        this.editBar.hide();
        this.topBar.editTurnOff();

        this.drawComponent.focusin();

        this.drawBar.show();
        break;
      case VisibleBar.DownloadBar:
        this.topBar.moveup();

        // Draw cleanup
        this.drawBar.hide();
        this.topBar.drawTurnoff();

        // Edit cleanup
        this.editBar.hide();
        this.topBar.editTurnOff();

        this.downloadBar.show();
        break;
    }
  }
}
