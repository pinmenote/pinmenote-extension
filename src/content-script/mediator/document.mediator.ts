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
import { IFrameMessageFactory, IFrameMessageType } from '../factory/html/iframe-message.model';
import { BrowserApi } from '../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../common/model/bus.model';
import { CIRCLE_PRELOADER_SVG } from './capture.preloader';
import { ObjCanvasDto } from '../../common/model/obj/obj-snapshot.dto';
import { ObjTypeDto } from '../../common/model/obj/obj.dto';
import { PageElementSnapshotAddCommand } from '../../common/command/snapshot/page-element-snapshot-add.command';
import { PinAddCommand } from '../../common/command/pin/pin-add.command';
import { PinAddFactory } from '../factory/pin-add.factory';
import { PinBorderDataDto } from '../../common/model/obj/obj-pin.dto';
import { PinComponentAddCommand } from '../command/pin/pin-component-add.command';
import { PinFactory } from '../factory/pin.factory';
import { SnapshotCreateCommand } from '../command/snapshot/snapshot-create.command';
import { UrlFactory } from '../../common/factory/url.factory';
import { applyStylesToElement } from '../../common/style.utils';
import { fnConsoleLog } from '../../common/fn/console.fn';
import { fnSleep } from '../../common/fn/sleep.fn';
import { pinStyles } from '../components/styles/pin.styles';

export interface StartListenersParams {
  stopCallback?: () => void;
  restart?: boolean;
  baseUrl?: string;
}

export class DocumentMediator {
  private static type?: ObjTypeDto;
  private static params?: StartListenersParams;
  private static overlay?: HTMLDivElement;
  private static overlayCanvas?: HTMLCanvasElement;

  private static preloader = document.createElement('div');

  static startListeners(type: ObjTypeDto, params?: StartListenersParams): void {
    this.type = type;
    this.params = params;
    fnConsoleLog(
      'DocumentMediator->startListeners->activeElement',
      document.activeElement,
      'lock',
      document.pointerLockElement
    );
    if (this.isIFrameActive && !params?.restart) {
      IFrameMessageFactory.postIFrame(document.activeElement as HTMLIFrameElement, {
        type: IFrameMessageType.START_LISTENERS,
        data: { type: this.type }
      });
    } else {
      this.startOverlay();
    }
  }

  private static get isIFrameActive(): boolean {
    return document.activeElement?.tagName.toLowerCase() === 'iframe';
  }

  private static startOverlay = (): void => {
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
    window.addEventListener('keydown', this.handleKeyDown);
  };

  static stopListeners(): void {
    if (this.overlayCanvas) return;
    fnConsoleLog('DocumentMediator->stopListeners');
    if (this.overlay) {
      this.overlay.removeEventListener('mousemove', this.handleOverlayMove);
      this.overlay.removeEventListener('click', this.handleOverlayClick);
      this.overlay.remove();
      this.overlay = undefined;
    }
    document.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('keydown', this.handleKeyDown);
    PinAddFactory.clear();
    if (this.params?.stopCallback) this.params.stopCallback();
  }

  private static handleScroll = (): void => {
    if (!this.overlay) return;
    // We have overlay canvas so pending ping - return
    if (this.overlayCanvas) return;
    this.overlay.style.top = `${window.scrollY}px`;
    this.overlay.style.left = `${window.scrollX}px`;
  };

  private static handleKeyDown = (e: KeyboardEvent): void => {
    e.preventDefault();
    e.stopImmediatePropagation();
    // TODO fix for iframe pass - use event from parent
    if (e.key === 'Escape') {
      this.overlayCanvas?.remove();
      this.overlayCanvas = undefined;
      this.stopListeners();
    }
  };

  private static handleOverlayClick = async (e: MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopImmediatePropagation();
    try {
      if (!this.overlay) return;

      // Calculate canvas
      let canvas;
      if (PinAddFactory.isCanvas) {
        // We have start point so now we just calculate canvas size
        if (PinAddFactory.startPoint) {
          const { x, y } = PinAddFactory.startPoint;
          const width = e.offsetX - x;
          const height = e.offsetY - y;
          canvas = PinFactory.objCanvasPinNew({ x, y, width, height });
          this.overlayCanvas?.remove();
          this.overlayCanvas = undefined;
        } else {
          // Add start point and create canvas to draw rectangle
          PinAddFactory.startPoint = { x: e.offsetX, y: e.offsetY };
          this.overlayCanvas = document.createElement('canvas');
          this.overlayCanvas.width = window.innerWidth;
          this.overlayCanvas.height = window.innerHeight;
          this.overlay.appendChild(this.overlayCanvas);
          return;
        }
      }

      const element = PinAddFactory.element;
      const border = PinAddFactory.border;
      if (!element) return;
      element.style.border = border.style;
      element.style.borderRadius = border.radius;
      this.stopListeners();
      switch (this.type) {
        case ObjTypeDto.PageElementPin: {
          await this.addElementPin(element, border, canvas);
          break;
        }
        case ObjTypeDto.PageElementSnapshot: {
          await this.addElementSnapshot(element, canvas);
          break;
        }
      }
    } catch (e) {
      fnConsoleLog('DocumentMediator->error', e);
    } finally {
      this.hidePreloader();
      this.stopListeners();
    }
  };

  private static handleOverlayMove = (e: MouseEvent): void => {
    // We are in canvas drawing mde so draw and return;
    e.stopImmediatePropagation();
    e.preventDefault();
    if (PinAddFactory.startPoint) {
      this.resizePinDiv(e);
      return;
    }

    const elements = document.elementsFromPoint(e.offsetX, e.offsetY);
    if (elements[1] instanceof HTMLIFrameElement) {
      fnConsoleLog('IFRAME PASS');
      IFrameMessageFactory.postIFrame(elements[1], {
        type: IFrameMessageType.START_LISTENERS,
        data: { type: this.type }
      });
      this.stopListeners();
    } else if (elements[1] instanceof HTMLElement) {
      this.updateFactoryElement(elements[1]);
    } else if (elements[1] instanceof SVGElement) {
      // svg !!!
    } else {
      fnConsoleLog('Unknown element', elements[1]);
    }
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
    const { x, y } = PinAddFactory.startPoint;
    const width = e.offsetX - x;
    const height = e.offsetY - y;
    ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ff0000';
    ctx.rect(x, y, width, height);
    ctx.stroke();
  };

  private static addElementPin = async (
    element: HTMLElement,
    border: PinBorderDataDto,
    canvas?: ObjCanvasDto
  ): Promise<void> => {
    this.showPreloader();
    const url = UrlFactory.newUrl();
    const snapshot = await new SnapshotCreateCommand(url, element, canvas).execute();
    const pagePin = PinFactory.objPagePinNew(element, snapshot, border);
    const obj = await new PinAddCommand(pagePin).execute();
    new PinComponentAddCommand(element, obj, true).execute();
  };

  private static addElementSnapshot = async (element: HTMLElement, canvas?: ObjCanvasDto): Promise<void> => {
    if (element) {
      PinAddFactory.clearStyles();

      await this.sleepUntilClearStyles();
      this.showPreloader();

      const url = UrlFactory.newUrl();
      const dto = await new SnapshotCreateCommand(url, element, canvas).execute();
      await new PageElementSnapshotAddCommand(dto).execute();
      await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_PAGE_ELEMENT_SNAPSHOT_ADD });
    }
  };

  private static sleepUntilClearStyles = async (): Promise<void> => {
    if (this.overlayCanvas) {
      const ctx = this.overlayCanvas.getContext('2d');
      ctx?.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
      await fnSleep(100);
    }
    let i = 0;
    while (PinAddFactory.hasStyles()) {
      // max 3 seconds
      if (i >= 30) return;
      await fnSleep(100);
      i += 1;
    }
    await fnSleep(100);
  };

  private static showPreloader = (): void => {
    this.preloader.innerHTML = CIRCLE_PRELOADER_SVG;
    this.preloader.style.zIndex = 'calc(9e999)';
    this.preloader.style.position = 'absolute';
    this.preloader.style.top = `${window.scrollY}px`;
    this.preloader.style.right = '0px';
    this.preloader.style.minWidth = '50px';
    this.preloader.style.minHeight = '50px';
    document.body.appendChild(this.preloader);
  };

  private static hidePreloader = (): void => {
    try {
      document.body.removeChild(this.preloader);
    } catch (e) {
      // TODO fix for overlayCanvas pins
      /* IGNORE */
    }
  };
}
