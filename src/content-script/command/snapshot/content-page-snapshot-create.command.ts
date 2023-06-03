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
import { ContentPageSegmentSaveCommand } from './content-page-segment-save.command';
import { ContentPageSegmentSaveImageCommand } from './content-page-segment-save-image.command';
import { HtmlSkipAttribute } from '../../model/html.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjUrlDto } from '../../../common/model/obj/obj.dto';
import { PinStore } from '../../store/pin.store';
import { ScreenshotFactory } from '../../../common/factory/screenshot.factory';
import { SettingsConfig } from '../../../common/environment';
import { XpathFactory } from '../../../common/factory/xpath.factory';
import { fnSha256Object } from '../../../common/fn/fn-sha256';

export class ContentPageSnapshotCreateCommand implements ICommand<Promise<PageSnapshotDto>> {
  constructor(
    private settings: SettingsConfig,
    private url: ObjUrlDto,
    private element: HTMLElement,
    private skipAttributes: HtmlSkipAttribute[],
    private canvas?: PageCanvasDto
  ) {}

  async execute(): Promise<PageSnapshotDto> {
    PinStore.each((v) => v.hide());
    const title =
      this.element === document.body
        ? document.title || this.url.origin || this.element.innerText.substring(0, 100)
        : this.element.innerText.substring(0, 100) || document.title || this.url.origin;

    const rect = this.canvas ? this.canvas.rect : XpathFactory.computeRect(this.element);

    let words: string[] = [];
    let contentHash = undefined;

    if (!this.canvas) {
      const res = await new ContentPageSegmentSaveCommand(this.element, this.skipAttributes).execute();
      contentHash = res.hash;
      words = res.words;
    } else if (this.element instanceof HTMLImageElement) {
      contentHash = await new ContentPageSegmentSaveImageCommand(this.element).execute();
    }

    const screenshot = await ScreenshotFactory.takeScreenshot(
      { settings: this.settings, document, window },
      rect,
      this.url
    );

    const info: Partial<PageSnapshotInfoDto> = {
      title,
      url: this.url,
      words,
      hashtags: []
    };
    info.hash = fnSha256Object(JSON.stringify(info));

    const data: Partial<PageSnapshotDataDto> = {
      screenshot,
      canvas: this.canvas
    };
    data.hash = fnSha256Object(JSON.stringify(data));

    PinStore.each((v) => v.show());

    return {
      info: info as PageSnapshotInfoDto,
      data: data as PageSnapshotDataDto,
      segmentHash: contentHash
    };
  }
}
