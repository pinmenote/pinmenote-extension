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
import { DrawToolDto } from '../../common/model/obj/obj-draw.dto';
import { HtmlEditComponent } from './html-edit/html-edit.component';
import { ObjDto } from '../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../common/model/obj/obj-pin.dto';
import { ObjRectangleDto } from '../../common/model/obj/obj-utils.dto';
import { PinEditBarComponent } from './pin-edit-bar/pin-edit-bar.component';
import { PinEditManager } from './pin-edit.manager';
import { PinMouseManager } from './pin-mouse.manager';
import { PinPointFactory } from '../factory/pin-point.factory';
import { TextContainerComponent } from './text/text-container.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { applyStylesToElement } from '../../common/style.utils';
import { isElementHiddenFn } from '../fn/is-element-hidden.fn';
import { pinStyles } from './styles/pin.styles';

export class PinComponent implements HtmlComponent<void>, PageComponent {
  readonly top = document.createElement('div');
  readonly bottom = document.createElement('div');

  private readonly mouseManager: PinMouseManager;

  readonly topBar: TopBarComponent;
  readonly text: TextContainerComponent;

  readonly drawComponent: DrawContainerComponent;
  readonly drawBar: DrawBarComponent;

  readonly downloadBar: DownloadBarComponent;

  readonly editBar: PinEditBarComponent;

  readonly htmlEditComponent: HtmlEditComponent;

  readonly edit: PinEditManager;

  private rect: ObjRectangleDto;

  private refValue: HTMLElement;

  constructor(ref: HTMLElement, readonly object: ObjDto<ObjPagePinDto>) {
    this.refValue = ref;
    this.rect = PinPointFactory.calculateRect(this.refValue);
    this.topBar = new TopBarComponent(this, object, this.rect);
    this.text = new TextContainerComponent(object, this.rect);

    this.mouseManager = new PinMouseManager(this, this.handleMouseOver, this.handleMouseOut);

    this.drawBar = new DrawBarComponent(this, this.rect);
    this.drawComponent = new DrawContainerComponent(this, this.rect);

    this.downloadBar = new DownloadBarComponent(this, this.rect);

    this.editBar = new PinEditBarComponent(this, this.rect);

    this.htmlEditComponent = new HtmlEditComponent(this);

    this.edit = new PinEditManager(this);
  }

  setNewRef(ref: HTMLElement): void {
    this.mouseManager.stop();
    this.refValue.style.border = this.object.data.html[0].border.style;
    this.refValue.style.borderRadius = this.object.data.html[0].border.radius;
    this.refValue.removeEventListener('mouseover', this.handleMouseOver);
    this.refValue.removeEventListener('mouseout', this.handleMouseOut);
    this.refValue.innerHTML = this.htmlEditComponent.originalHtml;
    this.refValue = ref;
    this.htmlEditComponent.setOriginalHtml(ref.innerHTML);
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
    if (this.object.local.drawVisible) this.drawComponent.focusin();

    // Download
    this.top.appendChild(this.downloadBar.render());

    // Pin Edit
    this.top.appendChild(this.editBar.render());

    // Html Edit
    this.top.appendChild(this.htmlEditComponent.render());
    this.edit.updateHtml();

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
    this.refValue.style.border = this.object.data.html[0].border.style;
    this.refValue.style.borderRadius = this.object.data.html[0].border.radius;

    this.text.cleanup();
    this.topBar.cleanup();
    this.top.remove();
    this.bottom.remove();
    this.mouseManager.stop();

    this.drawComponent.cleanup();
    this.drawBar.cleanup();
    this.editBar.cleanup();

    this.htmlEditComponent.cleanup();
  }

  private timeoutId = -1;

  private handleMouseOver = () => {
    window.clearTimeout(this.timeoutId);
    this.text.focusin();
    if (!this.edit.isScreenshot) this.topBar.focusin();
    this.drawBar.focusin();
    this.downloadBar.focusin();
    this.editBar.focusin();
    if (ContentSettingsStore.borderStyle === ContentSettingsStore.borderNone) {
      this.ref.style.border = ContentSettingsStore.newElementStyle;
    }
    this.timeoutId = window.setTimeout(this.handleMouseOut, 3000);
  };

  private handleMouseOut = () => {
    window.clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => {
      this.text.focusout();
      this.topBar.focusout();
      this.drawBar.focusout();
      this.downloadBar.focusout();
      this.editBar.focusout();
      if (ContentSettingsStore.borderStyle === ContentSettingsStore.borderNone) {
        this.ref.style.border = ContentSettingsStore.borderNone;
      }
      this.refValue.style.border = ContentSettingsStore.borderStyle;
    }, 2000);
  };

  isHidden(): boolean {
    return isElementHiddenFn(this.refValue);
  }
}
