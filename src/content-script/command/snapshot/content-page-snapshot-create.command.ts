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
import {
  PageCanvasDto,
  PageSnapshotDataDto,
  PageSnapshotDto,
  PageSnapshotInfoDto
} from '../../../common/model/obj/page-snapshot.dto';
import { AutoTagMediator } from '../../mediator/auto-tag.mediator';
import { ContentPageSegmentSaveCommand } from './content-page-segment-save.command';
import { ContentPageSegmentSaveImageCommand } from './content-page-segment-save-image.command';
import { ElementSizeFactory } from '../../../common/factory/element-size.factory';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ImageResizeFactory } from '../../../common/factory/image-resize.factory';
import { ObjRectangleDto } from '../../../common/model/obj/obj-utils.dto';
import { ObjUrlDto } from '../../../common/model/obj/obj.dto';
import { PageSkipAttribute } from '@pinmenote/page-compute';
import { PinStore } from '../../store/pin.store';
import { ScreenshotFactory } from '../../../common/factory/screenshot.factory';
import { SettingsConfig } from '../../../common/environment';
import { XpathFactory } from '@pinmenote/page-compute';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSha256Object } from '../../../common/fn/fn-hash';

export class ContentPageSnapshotCreateCommand implements ICommand<Promise<PageSnapshotDto>> {
  constructor(
    private settings: SettingsConfig,
    private url: ObjUrlDto,
    private element: HTMLElement,
    private skipAttributes: PageSkipAttribute[],
    private canvas?: PageCanvasDto
  ) {}

  async execute(): Promise<PageSnapshotDto> {
    PinStore.each((v) => v.hide());
    let title = '';
    let rect: ObjRectangleDto;
    let xpath: string | undefined;
    let isPartial = false;
    if (this.element === document.body) {
      title = document.title || this.url.origin || this.element.innerText.substring(0, 100);
      // document.body can have 0 height and display page correctly - looking at you youtube
      rect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    } else {
      title = this.element.innerText.substring(0, 100) || document.title || this.url.origin;
      rect = this.canvas ? this.canvas.rect : ElementSizeFactory.computeRect(this.element);
      xpath = XpathFactory.newXPathString(this.element);
      isPartial = true;
    }

    let screenshot = await ScreenshotFactory.takeScreenshot(document, window, this.settings, rect, this.url);
    if (!this.canvas && this.element === document.body && (rect.width > 640 || rect.height > 360)) {
      screenshot = await ImageResizeFactory.resize2(
        document,
        ScreenshotFactory.THUMB_SETTINGS,
        ScreenshotFactory.THUMB_SIZE,
        screenshot
      );
    }

    let segment = undefined;

    if (!this.canvas) {
      fnConsoleLog('ContentPageSnapshotCreateCommand->isPartial', isPartial);
      segment = await new ContentPageSegmentSaveCommand(this.element, this.skipAttributes, isPartial).execute();
    } else if (this.element instanceof HTMLImageElement) {
      segment = await new ContentPageSegmentSaveImageCommand(this.element).execute();
    }
    const words = AutoTagMediator.computeTags(this.element);

    const info: Partial<PageSnapshotInfoDto> = {
      title,
      url: this.url,
      words
    };
    info.hash = fnSha256Object(info);

    const data: Partial<PageSnapshotDataDto> = {
      screenshot,
      canvas: this.canvas,
      xpath
    };
    data.hash = fnSha256Object(data);

    PinStore.each((v) => v.show());

    const pageSnapshot: Omit<PageSnapshotDto, 'hash'> = {
      info: info as PageSnapshotInfoDto,
      data: data as PageSnapshotDataDto,
      segment
    };

    const hash = fnSha256Object(pageSnapshot);

    return { ...pageSnapshot, hash };
  }
}
