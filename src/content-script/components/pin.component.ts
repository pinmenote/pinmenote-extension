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
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { ContentSettingsStore } from '../store/content-settings.store';
import { DownloadBarComponent } from './download-bar/download-bar.component';
import { DrawBarComponent } from './draw-bar/draw-bar.component';
import { DrawContainerComponent } from './draw-container.component';
import { DrawToolDto } from '../../common/model/obj/obj-draw.dto';
import { ObjAddHashtagsCommand } from '../../common/command/obj/hashtag/obj-add-hashtags.command';
import { ObjCanvasDto } from '../../common/model/obj/obj-snapshot.dto';
import { ObjDto } from '../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../common/model/obj/obj-pin.dto';
import { ObjRectangleDto } from '../../common/model/obj/obj-utils.dto';
import { PinEditBarComponent } from './pin-edit-bar/pin-edit-bar.component';
import { PinEditManager } from './pin-edit.manager';
import { PinMouseManager } from './pin-mouse.manager';
import { PinPointFactory } from '../factory/pin-point.factory';
import { PinUpdateCommand } from '../../common/command/pin/pin-update.command';
import { TextContainerComponent } from './text/text-container.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { applyStylesToElement } from '../../common/style.utils';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { isElementHiddenFn } from '../fn/is-element-hidden.fn';
import { pinStyles } from './styles/pin.styles';
import { scrollToElementFn } from '../fn/scroll-to-element.fn';

export class PinComponent implements HtmlComponent<void>, PageComponent {
  readonly top = document.createElement('div');
  readonly bottom = document.createElement('div');
  readonly border = document.createElement('div');

  private readonly mouseManager: PinMouseManager;

  readonly topBar: TopBarComponent;
  readonly bottomBar: BottomBarComponent;
  readonly text: TextContainerComponent;

  readonly drawComponent: DrawContainerComponent;
  readonly drawBar: DrawBarComponent;

  readonly downloadBar: DownloadBarComponent;

  readonly editBar: PinEditBarComponent;

  readonly edit: PinEditManager;

  private rect: ObjRectangleDto;

  private refValue: HTMLElement;
  private readonly canvas?: ObjCanvasDto;

  constructor(ref: HTMLElement, readonly object: ObjDto<ObjPagePinDto>) {
    this.refValue = ref;
    this.canvas = object.data.snapshot.canvas;
    this.rect = this.canvas ? this.canvas.rect : PinPointFactory.calculateRect(this.refValue);
    this.topBar = new TopBarComponent(this, object, this.rect);
    this.bottomBar = new BottomBarComponent(this, object, this.rect);
    this.text = new TextContainerComponent(this.rect, this.addCommentCallback);

    this.mouseManager = new PinMouseManager(this, this.handleMouseOver, this.handleMouseOut);

    this.drawBar = new DrawBarComponent(this, this.rect);
    this.drawComponent = new DrawContainerComponent(this, this.rect);

    this.downloadBar = new DownloadBarComponent(this, this.rect);

    this.editBar = new PinEditBarComponent(this, this.rect);

    this.edit = new PinEditManager(this);
  }

  setNewRef(ref: HTMLElement): void {
    this.mouseManager.stop();
    this.refValue.style.border = this.object.data.border.style;
    this.refValue.style.borderRadius = this.object.data.border.radius;
    this.refValue.removeEventListener('mouseover', this.handleMouseOver);
    this.refValue.removeEventListener('mouseout', this.handleMouseOut);
    this.refValue = ref;
    this.mouseManager.start();
  }

  get ref(): HTMLElement {
    return this.refValue;
  }

  focus(): void {
    scrollToElementFn(this.refValue, this.refValue.getBoundingClientRect().height / 2);
    this.handleMouseOver();
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
    this.bottom.appendChild(this.bottomBar.render());
    this.bottom.appendChild(this.text.render());

    this.top.appendChild(this.topBar.render());

    // Draw
    this.top.appendChild(this.drawComponent.render());
    this.top.appendChild(this.drawBar.render());
    this.drawBar.setSize(4);
    this.drawBar.setTool(DrawToolDto.Pencil);
    if (this.object.local?.drawVisible) {
      this.drawComponent.focusin();
      this.drawComponent.drawArea.canDraw = false;
    }

    // Download
    this.top.appendChild(this.downloadBar.render());

    // Pin Edit
    this.top.appendChild(this.editBar.render());

    document.body.appendChild(this.top);
    document.body.appendChild(this.bottom);
    this.mouseManager.start();
    this.handleMouseOut();

    // If not canvas
    if (this.canvas) {
      this.border.style.minWidth = `${this.rect.width}px`;
      this.border.style.minHeight = `${this.rect.height - 4}px`;
      this.border.style.position = 'absolute';
      this.border.style.pointerEvents = 'none';
      this.border.style.top = `${this.rect.y}px`;
      this.border.style.left = `${this.rect.x}px`;
      this.border.style.border = ContentSettingsStore.newElementStyle;
      document.body.appendChild(this.border);
    } else {
      this.refValue.style.border = ContentSettingsStore.borderStyle;
      this.refValue.style.borderRadius = ContentSettingsStore.borderRadius;
    }
  }

  resize(): void {
    if (this.canvas) {
      this.rect = this.canvas.rect;
    } else {
      this.rect = PinPointFactory.calculateRect(this.refValue);
    }
    this.top.style.top = `${this.rect.y}px`;
    this.top.style.left = `${this.rect.x}px`;
    this.bottom.style.top = `${this.rect.y + this.rect.height}px`;
    this.bottom.style.left = `${this.rect.x}px`;

    this.text.resize(this.rect);
    this.topBar.resize(this.rect);
    this.bottomBar.resize(this.rect);
    this.drawComponent.resize(this.rect);
    this.drawBar.resize(this.rect);
    this.downloadBar.resize(this.rect);
    this.editBar.resize(this.rect);
  }

  cleanup(): void {
    this.refValue.style.border = this.object.data.border.style;
    this.refValue.style.borderRadius = this.object.data.border.radius;

    this.text.cleanup();
    this.topBar.cleanup();
    this.bottomBar.cleanup();
    this.top.remove();
    this.bottom.remove();
    this.border.remove();
    this.mouseManager.stop();

    this.drawComponent.cleanup();
    this.drawBar.cleanup();
    this.editBar.cleanup();
  }

  private addCommentCallback = async (value: string): Promise<void> => {
    await new ObjAddHashtagsCommand(this.object.id, value).execute();
    this.object.data.comments.data.push({ value });
    try {
      await new PinUpdateCommand(this.object).execute();
    } catch (e) {
      fnConsoleLog('ERROR UPDATE PIN', e);
    }
  };

  private timeoutId = -1;

  private handleMouseOver = () => {
    window.clearTimeout(this.timeoutId);

    if (!this.edit.isScreenshot) this.topBar.focusin();
    if (!this.edit.isScreenshot) this.bottomBar.focusin();

    this.drawBar.focusin();
    this.downloadBar.focusin();
    this.editBar.focusin();
    if (ContentSettingsStore.borderStyle === ContentSettingsStore.borderNone) {
      this.ref.style.border = ContentSettingsStore.newElementStyle;
    }
    if (!this.canvas) this.timeoutId = window.setTimeout(this.handleMouseOut, 3000);
  };

  private handleMouseOut = () => {
    window.clearTimeout(this.timeoutId);
    if (this.canvas) return;
    this.timeoutId = window.setTimeout(() => {
      this.topBar.focusout();
      this.bottomBar.focusout();
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
