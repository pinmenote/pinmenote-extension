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
import { ContentPageElementSnapshotAddCommand } from '../command/snapshot/content-page-element-snapshot-add.command';
import { ObjTypeDto } from '../../common/model/obj/obj.dto';
import { PinAddCommand } from '../../common/command/pin/pin-add.command';
import { PinAddFactory } from '../factory/pin-add.factory';
import { PinComponentAddCommand } from '../command/pin/pin-component-add.command';
import { PinFactory } from '../factory/pin.factory';
import { PopupPinStartRequest } from '../../common/model/obj-request.model';
import { SnapshotCreateCommand } from '../command/snapshot/snapshot-create.command';
import { UrlFactory } from '../../common/factory/url.factory';
import { applyStylesToElement } from '../../common/style.utils';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { pinStyles } from '../components/styles/pin.styles';

export class DocumentMediator {
  private static type?: ObjTypeDto;
  private static overlay?: HTMLDivElement;
  private static overlayCanvas?: HTMLCanvasElement;

  static startListeners(data: PopupPinStartRequest, href?: string): void {
    if (href !== data.url.href) {
      // fnConsoleLog('SKIP', href);
      return;
    }
    fnConsoleLog('DocumentMediator->startListeners', href);
    this.type = data.type;
    this.overlay = document.createElement('div');
    applyStylesToElement(this.overlay, pinStyles);
    this.overlay.style.top = `${window.scrollY}px`;
    this.overlay.style.left = `${window.scrollX}px`;
    this.overlay.style.width = `${window.innerWidth}px`;
    this.overlay.style.height = `${window.innerHeight}px`;
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('mousemove', this.handleOverlayMove);
    this.overlay.addEventListener('click', this.handleOverlayClick);
    document.addEventListener('scroll', this.handleScroll);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  static stopListeners(): void {
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay.removeEventListener('mousemove', this.handleOverlayMove);
      this.overlay.removeEventListener('click', this.handleOverlayClick);
      this.overlay = undefined;
      this.overlayCanvas = undefined;
    }
    document.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('keydown', this.handleKeyDown);
    PinAddFactory.clear();
    this.type = undefined;
  }

  private static handleScroll = (): void => {
    if (!this.overlay) return;
    this.overlay.style.top = `${window.scrollY}px`;
    this.overlay.style.left = `${window.scrollX}px`;
  };

  private static handleKeyDown = (e: KeyboardEvent): void => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.key === 'Escape') {
      this.stopListeners();
    }
  };

  private static handleOverlayClick = async (e: MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopImmediatePropagation();
    try {
      if (!this.overlay) return;
      const element = PinAddFactory.element;

      if (PinAddFactory.isCanvas) {
        if (PinAddFactory.startPoint) {
          alert('Add canvas and remove return');
          return;
        } else {
          PinAddFactory.startPoint = { x: e.offsetX, y: e.offsetY };
          this.overlayCanvas = document.createElement('canvas');
          this.overlayCanvas.width = window.innerWidth;
          this.overlayCanvas.height = window.innerHeight;
          this.overlay.appendChild(this.overlayCanvas);
          return;
        }
      }
      if (!element) return;
      switch (this.type) {
        case ObjTypeDto.PageElementPin: {
          await this.addElementPin(element);
          break;
        }
        case ObjTypeDto.PageElementSnapshot: {
          await this.addElementSnapshot(element);
          break;
        }
      }
    } finally {
      this.stopListeners();
    }
  };

  private static handleOverlayMove = (e: MouseEvent): void => {
    const elements = document.elementsFromPoint(e.offsetX, e.offsetY);

    // skip cause we're in canvas select mode
    if (PinAddFactory.startPoint) {
      this.resizePinDiv(e);
      return;
    }

    if (elements[1] instanceof HTMLElement) {
      this.updateFactoryElement(elements[1]);
    } else {
      fnConsoleLog('Unknown element', elements[1]);
    }
    // this.resizePinDiv(e);
    //
  };

  private static updateFactoryElement = (element: HTMLElement): void => {
    PinAddFactory.clear();
    if (element instanceof HTMLElement) {
      PinAddFactory.updateElement(element);
    }
  };

  private static resizePinDiv = (e: MouseEvent): void => {
    if (!this.overlayCanvas || !PinAddFactory.startPoint) return;
    const ctx = this.overlayCanvas.getContext('2d');
    if (!ctx) return;
    const width = e.offsetX - PinAddFactory.startPoint.x;
    const height = e.offsetY - PinAddFactory.startPoint.y;
    ctx.beginPath();
    ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ff0000';
    ctx.rect(PinAddFactory.startPoint.x, PinAddFactory.startPoint.y, width, height);
    ctx.stroke();
  };

  private static addElementPin = async (element: HTMLElement): Promise<void> => {
    if (element) {
      const url = UrlFactory.newUrl();
      const snapshot = await new SnapshotCreateCommand(url, element).execute();
      const pagePin = PinFactory.objPagePinNew(element, snapshot);
      const obj = await new PinAddCommand(pagePin).execute();
      new PinComponentAddCommand(element, obj, true).execute();
    }
  };

  private static addElementSnapshot = async (element: HTMLElement): Promise<void> => {
    if (element) {
      const url = UrlFactory.newUrl();
      await new ContentPageElementSnapshotAddCommand(url, element).execute();
    }
  };

  /*private static addCanvasPin = async (offsetX: number, offsetY: number): Promise<void> => {
    if (!this.pinStart) return;

    const width = offsetX - this.pinStart.x;
    const height = offsetY - this.pinStart.y;
    const rect: ObjRectangleDto = {
      x: this.pinStart.x,
      y: this.pinStart.y,
      width,
      height
    };
    const canvasPin = await PinFactory.objCanvasPinNew(rect);

    const obj = await new CanvasPinAddCommand(canvasPin).execute();

    new CanvasPinComponentAddCommand(obj, false).execute();
  };*/
}
