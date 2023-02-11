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
import { ObjPointDto, ObjRectangleDto } from '../../common/model/obj-utils.model';
import { CanvasPinAddCommand } from '../../common/command/canvas/canvas-pin-add.command';
import { CanvasPinComponentAddCommand } from '../command/canvas/canvas-pin-component-add.command';
import { PinAddFactory } from '../factory/pin-add.factory';
import { PinFactory } from '../factory/pin.factory';
import { PopupPinStartRequest } from '../../common/model/obj-request.model';
import { applyStylesToElement } from '../../common/style.utils';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { pinStyles } from '../components/styles/pin.styles';

export class DocumentMediator {
  private static pinStart?: ObjPointDto;
  private static overlay?: HTMLDivElement;
  private static overlayCanvas?: HTMLCanvasElement;

  static startListeners(data: PopupPinStartRequest, href?: string): void {
    if (href !== data.url.href) {
      fnConsoleLog('SKIP', href);
      return;
    }
    const canvasList = Array.from(document.getElementsByTagName('canvas'));
    let canvasFound = false;
    for (let i = 0; i < canvasList.length; i++) {
      if (canvasList[i].width >= window.innerWidth && canvasList[i].height >= window.innerHeight) {
        canvasFound = true;
        break;
      }
    }
    // Well, canvas web pages...
    if (canvasFound) {
      this.overlay = document.createElement('div');
      applyStylesToElement(this.overlay, pinStyles);
      this.overlay.style.top = '0px';
      this.overlay.style.left = '0px';
      this.overlay.style.width = `${window.innerWidth}px`;
      this.overlay.style.height = `${window.innerHeight}px`;
      this.overlayCanvas = document.createElement('canvas');
      this.overlayCanvas.width = window.innerWidth;
      this.overlayCanvas.height = window.innerHeight;
      this.overlay.appendChild(this.overlayCanvas);
      document.body.appendChild(this.overlay);
      this.overlay.addEventListener('click', this.handleOverlayClick);
      this.overlay.addEventListener('mousemove', this.handleOverlayMove);
    } else {
      document.addEventListener('mouseover', this.handleMouseOver);
    }
    document.addEventListener('keydown', this.handleKeyDown);
  }

  static stopListeners(): void {
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay.removeEventListener('click', this.handleOverlayClick);
      this.overlay.removeEventListener('mousemove', this.handleOverlayMove);
      this.overlay = undefined;
      this.overlayCanvas = undefined;
      this.pinStart = undefined;
    } else {
      document.removeEventListener('mouseover', this.handleMouseOver);
    }
    document.removeEventListener('keydown', this.handleKeyDown);
    PinAddFactory.clear();
  }

  private static handleKeyDown = (e: KeyboardEvent): void => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.key === 'Escape') {
      this.stopListeners();
    }
  };

  private static handleMouseOver = (event: MouseEvent): void => {
    if (PinAddFactory.hasElement) {
      PinAddFactory.clear();
    }
    if (event.target instanceof HTMLElement) {
      PinAddFactory.updateElement(event.target);
    }
  };

  private static handleOverlayClick = async (e: MouseEvent): Promise<void> => {
    if (!this.pinStart) {
      this.pinStart = { x: e.offsetX, y: e.offsetY };
    } else {
      await this.addCanvasPin(e.offsetX, e.offsetY);
      this.stopListeners();
    }
  };

  private static handleOverlayMove = (e: MouseEvent): void => {
    this.resizePinDiv(e);
  };

  private static resizePinDiv = (e: MouseEvent): void => {
    if (!this.pinStart || !this.overlayCanvas) return;
    const ctx = this.overlayCanvas.getContext('2d');
    if (!ctx) return;
    const width = e.offsetX - this.pinStart.x;
    const height = e.offsetY - this.pinStart.y;
    ctx.beginPath();
    ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ff0000';
    ctx.rect(this.pinStart.x, this.pinStart.y, width, height);
    ctx.stroke();
  };

  private static addCanvasPin = async (offsetX: number, offsetY: number): Promise<void> => {
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
  };
}
