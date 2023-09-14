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
import { HtmlComponent, PageComponent, PinDocument } from './model/pin-view.model';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { DocumentMediator } from '../../../content-script/mediator/document.mediator';
import { DownloadBarComponent } from './download-bar/download-bar.component';
import { DrawBarComponent } from './draw-bar/draw-bar.component';
import { DrawBarMainComponent } from './draw-bar/draw-bar-main.component';
import { DrawContainerComponent } from './draw-container.component';
import { DrawToolDto } from '../../model/obj/obj-draw.dto';
import { ObjDto } from '../../model/obj/obj.dto';
import { ObjPinDto } from '../../model/obj/obj-pin.dto';
import { PinEditBarComponent } from './pin-edit-bar/pin-edit-bar.component';
import { PinEditManager } from './pin-edit.manager';
import { PinEditModel } from './model/pin-edit.model';
import { PinMouseManager } from './pin-mouse.manager';
import { PinPointFactory } from '../../factory/pin-point.factory';
import { PinRemoveCommand } from '../../command/pin/pin-remove.command';
import { TextContainerComponent } from './text/text-container.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { applyStylesToElement } from '../../style.utils';
import { fnIsElementHidden } from '../../fn/fn-is-element-hidden';
import { pinStyles } from './styles/pin.styles';

export class PinComponent implements HtmlComponent<void>, PageComponent {
  readonly top: HTMLDivElement;
  readonly bottom: HTMLDivElement;
  readonly border: HTMLDivElement;

  private readonly mouseManager: PinMouseManager;
  private timeoutEnabled = false;

  readonly topBar: TopBarComponent;
  readonly bottomBar: BottomBarComponent;
  readonly text: TextContainerComponent;

  readonly drawComponent: DrawContainerComponent;
  readonly drawBar: DrawBarComponent;
  readonly drawMain: DrawBarMainComponent;

  readonly downloadBar: DownloadBarComponent;

  readonly editBar: PinEditBarComponent;

  readonly edit: PinEditManager;

  readonly model: PinEditModel;

  constructor(ref: HTMLElement, object: ObjDto<ObjPinDto>, private doc: PinDocument) {
    this.top = this.doc.document.createElement('div');
    this.bottom = this.doc.document.createElement('div');
    this.border = this.doc.document.createElement('div');
    this.mouseManager = new PinMouseManager(this.top, this.bottom, this.handleMouseOver, this.handleMouseOut);
    this.model = new PinEditModel(object, ref, this, this.mouseManager, doc);
    this.edit = new PinEditManager(this);

    this.topBar = new TopBarComponent(this.edit, this.model);
    this.bottomBar = new BottomBarComponent(this.edit, this.model);
    this.text = new TextContainerComponent(this.model);

    this.drawBar = new DrawBarComponent(this.edit, this.model);
    this.drawMain = new DrawBarMainComponent(this.edit, this.model);
    this.drawComponent = new DrawContainerComponent(this.model);

    this.downloadBar = new DownloadBarComponent(this.edit, this.model);

    this.editBar = new PinEditBarComponent(this.model, this.resize, this.toSnapshotHandler);
  }

  private toSnapshotHandler = async () => {
    await new PinRemoveCommand(this.model.id, this.model.url).execute();
    this.cleanup();
    await DocumentMediator.addElementSnapshot(this.model.ref);
    DocumentMediator.hidePreloader();
  };

  focus(): void {
    this.handleMouseOver();
  }

  render(): void {
    const bottomStyles = Object.assign(
      {
        left: `${this.model.rect.x}px`,
        top: `${this.model.rect.y + this.model.rect.height}px`
      },
      pinStyles
    );
    const topStyles = Object.assign(
      {
        left: `${this.model.rect.x}px`,
        top: `${this.model.rect.y}px`
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
    this.top.appendChild(this.drawMain.render());
    this.top.appendChild(this.drawBar.render());

    this.drawBar.setSize(4);
    this.drawBar.setTool(DrawToolDto.Pencil);

    if (this.model.local.drawVisible) {
      this.drawComponent.focusin();
      this.drawComponent.drawArea.canDraw = false;
    }

    // Download
    this.top.appendChild(this.downloadBar.render());

    // Pin Edit
    this.top.appendChild(this.editBar.render());

    this.doc.document.body.appendChild(this.bottom);
    this.doc.document.body.appendChild(this.top);
    this.mouseManager.start(this.model.ref);
    this.handleMouseOut();

    // If not canvas
    if (this.model.canvas) {
      this.border.style.minWidth = `${this.model.rect.width}px`;
      this.border.style.minHeight = `${this.model.rect.height - 4}px`;
      this.border.style.position = 'absolute';
      this.border.style.pointerEvents = 'none';
      this.border.style.top = `${this.model.rect.y}px`;
      this.border.style.left = `${this.model.rect.x}px`;
      this.border.style.border = this.doc.settings.newElementStyle;
      this.doc.document.body.appendChild(this.border);
    } else {
      this.model.ref.style.border = this.doc.settings.borderStyle;
      this.model.ref.style.borderRadius = this.doc.settings.borderRadius;
    }
  }

  resize = (): void => {
    if (this.model.canvas) {
      this.model.rect = this.model.canvas.rect;
    } else {
      this.model.rect = PinPointFactory.calculateRect(this.model.ref);
    }
    this.top.style.top = `${this.model.rect.y}px`;
    this.top.style.left = `${this.model.rect.x}px`;
    this.bottom.style.top = `${this.model.rect.y + this.model.rect.height}px`;
    this.bottom.style.left = `${this.model.rect.x}px`;

    this.text.resize();
    this.topBar.resize();
    this.bottomBar.resize();

    this.drawComponent.resize();
    this.drawBar.resize();
    this.drawMain.resize();

    this.downloadBar.resize();
    this.editBar.resize();
  };

  cleanup(): void {
    this.model.ref.style.border = this.model.border.style;
    this.model.ref.style.borderRadius = this.model.border.radius;

    this.text.cleanup();
    this.topBar.cleanup();
    this.bottomBar.cleanup();
    this.top.remove();
    this.bottom.remove();
    this.border.remove();
    this.mouseManager.stop(this.model.ref);

    this.drawComponent.cleanup();
    this.drawBar.cleanup();
    this.drawMain.cleanup();
    this.editBar.cleanup();
  }

  private timeoutId = -1;

  private handleMouseOver = () => {
    this.doc.window.clearTimeout(this.timeoutId);

    if (!this.edit.isScreenshot) this.topBar.focusin();
    if (!this.edit.isScreenshot) this.bottomBar.focusin();

    this.drawBar.focusin();
    this.downloadBar.focusin();
    this.editBar.focusin();
    if (this.doc.settings.borderStyle === 'none') {
      this.model.ref.style.border = this.doc.settings.newElementStyle;
    }
    if (!this.model.canvas && this.timeoutEnabled)
      this.timeoutId = this.doc.window.setTimeout(this.handleMouseOut, 3000);
  };

  private handleMouseOut = () => {
    this.doc.window.clearTimeout(this.timeoutId);
    if (this.model.canvas || !this.timeoutEnabled) return;
    this.timeoutId = this.doc.window.setTimeout(() => {
      this.topBar.focusout();
      this.bottomBar.focusout();
      this.drawBar.focusout();
      this.downloadBar.focusout();
      this.editBar.focusout();
      if (this.doc.settings.borderStyle === 'none') {
        this.model.ref.style.border = 'none';
      }
      this.model.ref.style.border = this.doc.settings.borderStyle;
    }, 2000);
  };

  isHidden(): boolean {
    return fnIsElementHidden(this.model.ref);
  }

  hide(): void {
    if (!this.model.canvas) {
      this.model.ref.style.border = this.doc.settings.borderStyle;
      this.model.ref.style.borderRadius = this.doc.settings.borderRadius;
    }
    this.top.style.display = 'none';
    this.bottom.style.display = 'none';
  }

  show(): void {
    if (!this.model.canvas) {
      this.model.ref.style.border = this.doc.settings.borderStyle;
      this.model.ref.style.borderRadius = this.doc.settings.borderRadius;
    }
    this.top.style.display = 'flex';
    this.bottom.style.display = 'flex';
  }
}
