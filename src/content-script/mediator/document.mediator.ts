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
import { ObjTypeDto, ObjUrlDto } from '../../common/model/obj/obj.dto';
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../common/model/bus.model';
import { CIRCLE_PRELOADER_SVG } from './capture.preloader';
import { ContentPageSnapshotCreateCommand } from '../command/snapshot/content-page-snapshot-create.command';
import { ContentSettingsStore } from '../store/content-settings.store';
import { IFrameIndexMessage } from '../../common/model/iframe-message.model';
import { IFrameStore } from '../store/iframe.store';
import { PageCanvasDto } from '../../common/model/obj/page-snapshot.dto';
import { PageSkipAttribute } from '@pinmenote/page-compute';
import { PageSnapshotAddCommand } from '../../common/command/snapshot/page-snapshot-add.command';
import { PinAddCommand } from '../command/pin/pin-add.command';
import { PinAddFactory } from '../factory/pin-add.factory';
import { PinBorderDataDto } from '../../common/model/obj/obj-pin.dto';
import { PinComponentAddCommand } from '../command/pin/pin-component-add.command';
import { PinFactory } from '../factory/pin.factory';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { UrlFactory } from '../../common/factory/url.factory';
import { applyStylesToElement } from '../../common/style.utils';
import { fnConsoleLog } from '../../common/fn/fn-console';
import { fnSleep } from '../../common/fn/fn-sleep';
import { fnUid } from '../../common/fn/fn-uid';
import { pinStyles } from '../../common/components/pin/styles/pin.styles';

export class DocumentMediator {
  static type?: ObjTypeDto;
  static active = false;
  private static baseUrl?: ObjUrlDto;
  private static iframe = false;
  private static overlay?: HTMLDivElement;
  private static overlayCanvas?: HTMLCanvasElement;

  private static startingIframeListeners = false;

  private static preloader = document.createElement('div');

  static startListeners(type: ObjTypeDto, baseUrl?: ObjUrlDto, iframe = false): void {
    fnConsoleLog('DocumentMediator->startListeners', type, baseUrl, iframe);
    if (this.active) return;
    this.type = type;
    this.baseUrl = baseUrl;
    this.iframe = iframe;
    if (this.isIFrameActive) this.startIframeListeners(document.activeElement as HTMLIFrameElement);
    this.startOverlay();
    this.active = true;
  }

  static resumeListeners(type: ObjTypeDto) {
    this.startListeners(type, this.baseUrl, this.iframe);
  }

  private static startIframeListeners(ref: HTMLIFrameElement) {
    if (this.startingIframeListeners) return;
    this.startingIframeListeners = true;
    const msg = IFrameStore.getInstance().findIndex(ref);
    if (!msg) {
      this.startingIframeListeners = false;
      return;
    }
    fnConsoleLog('DocumentMediator->startIframeListeners', msg, this.baseUrl, this.iframe);

    const key = TinyDispatcher.getInstance().addListener<IFrameIndexMessage>(
      BusMessageType.IFRAME_START_LISTENERS_RESULT,
      (event, key, value) => {
        if (msg.uid === value.uid) {
          fnConsoleLog('DocumentMediator->startIframeListeners->IFRAME_START_LISTENERS_RESULT');
          clearTimeout(timeout);
          TinyDispatcher.getInstance().removeListener(event, key);
          this.stopListeners(false);
          this.startingIframeListeners = false;
          IFrameStore.passListeners(msg);
        }
      }
    );
    BrowserApi.sendRuntimeMessage({
      type: BusMessageType.IFRAME_START_LISTENERS,
      data: { ...msg, type: this.type, url: this.baseUrl }
    })
      .then(() => {
        /* IGNORE */
      })
      .catch(() => {
        /* IGNORE */
      });

    const timeout = setTimeout(() => {
      fnConsoleLog('DocumentMediator->startIframeListeners->timeout');
      this.startingIframeListeners = false;
      TinyDispatcher.getInstance().removeListener(BusMessageType.IFRAME_START_LISTENERS_RESULT, key);
    }, 1000);
  }

  private static get isIFrameActive(): boolean {
    return (
      !!document.activeElement &&
      document.activeElement?.tagName.toLowerCase() === 'iframe' &&
      this.checkIframeSizePosition(document.activeElement)
    );
  }

  private static checkIframeSizePosition(elm: Element): boolean {
    const rect = elm.getBoundingClientRect();
    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    // TODO verify if 4/5 size ratio is ok - mainly we check this cause of office365 apps running inside iframe
    return (
      rect.height > (window.innerHeight * 4) / 5 &&
      rect.width > (window.innerWidth * 4) / 5 &&
      !(rect.bottom < 0 || rect.top - viewHeight >= 0)
    );
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

  static stopListeners(iframe = true): void {
    if (this.overlayCanvas) return;
    if (!this.active) return;
    this.startingIframeListeners = false;
    this.active = false;
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
    // Cleanup iframe
    if (iframe) IFrameStore.stopListeners();
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
      this.stopListeners(true);
    }
  };

  private static handleOverlayClick = async (e: MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopImmediatePropagation();
    try {
      if (!this.overlay) return;

      // Calculate canvas
      let canvas;
      fnConsoleLog('handleOverlayClick->target', e.target);
      if (PinAddFactory.isCanvas) {
        // We have start point so now we just calculate canvas size
        if (PinAddFactory.startPoint) {
          const { x, y } = PinAddFactory.startPoint;
          const width = e.offsetX - x;
          const height = e.offsetY - y;
          if (width > 10 && height > 10) {
            canvas = PinFactory.objCanvasPinNew({ x, y, width, height });
          }
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
        case ObjTypeDto.PageAlter: {
          element.setAttribute('contenteditable', 'true');
          element.focus();
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
      this.startIframeListeners(elements[1]);
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
    canvas?: PageCanvasDto
  ): Promise<void> => {
    PinAddFactory.clearStyles();

    await this.sleepUntilClearStyles();
    const url = UrlFactory.newUrl();
    const pagePin = await PinFactory.objPagePinNew(url, element, border, this.iframe, this.baseUrl, canvas);
    const obj = await new PinAddCommand(pagePin).execute();
    new PinComponentAddCommand(element, obj, true).execute();
  };

  static addElementSnapshot = async (element: HTMLElement, canvas?: PageCanvasDto): Promise<void> => {
    if (!element) return;
    PinAddFactory.clearStyles();

    await this.sleepUntilClearStyles();
    const skipUid = this.showPreloader();

    const url = UrlFactory.newUrl();
    const dto = await new ContentPageSnapshotCreateCommand(
      ContentSettingsStore.settings,
      url,
      element,
      [skipUid],
      canvas
    ).execute();
    await new PageSnapshotAddCommand(dto, ObjTypeDto.PageElementSnapshot).execute();
    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_PAGE_ELEMENT_SNAPSHOT_ADD });
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

  private static showPreloader = (): PageSkipAttribute => {
    const key = `data-${fnUid()}`;
    this.preloader.innerHTML = CIRCLE_PRELOADER_SVG;
    this.preloader.setAttribute(key, 'true');
    this.preloader.style.zIndex = 'calc(9e999)';
    this.preloader.style.position = 'fixed';
    this.preloader.style.top = `0px`;
    this.preloader.style.right = '0px';
    this.preloader.style.minWidth = '50px';
    this.preloader.style.maxWidth = '50px';
    this.preloader.style.minHeight = '50px';
    this.preloader.style.maxHeight = '50px';
    document.body.appendChild(this.preloader);
    return { key, value: 'true' };
  };

  static hidePreloader = (): void => {
    try {
      document.body.removeChild(this.preloader);
    } catch (e) {
      // TODO fix for overlayCanvas pins
      /* IGNORE */
    }
  };
}
