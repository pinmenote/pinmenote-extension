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
import { OBJ_DTO_VERSION, ObjDto, ObjTypeDto } from '../../model/obj/obj.dto';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ContentSettingsStore } from '../../../content-script/store/content-settings.store';
import { FetchResponse } from '@pinmenote/fetch-service';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjAddIdCommand } from '../obj/id/obj-add-id.command';
import { ObjNextIdCommand } from '../obj/id/obj-next-id.command';
import { ObjPdfDataDto, ObjPdfDto } from '../../model/obj/obj-pdf.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { ScreenshotFactory } from '../../factory/screenshot.factory';
import { UrlFactory } from '../../factory/url.factory';
import { fnSha256, fnSha256Object } from '../../fn/fn-hash';
import { ImageResizeFactory } from '../../factory/image-resize.factory';

export class PdfAddCommand implements ICommand<Promise<void>> {
  constructor(private value: FetchResponse<string>) {}
  async execute(): Promise<void> {
    const id = await new ObjNextIdCommand().execute();
    const dt = Date.now();

    const hash = fnSha256(this.value.data);
    let screenshot = await ScreenshotFactory.takeScreenshot(document, window, ContentSettingsStore.settings);
    screenshot = await ImageResizeFactory.resize2(
      document,
      ScreenshotFactory.THUMB_SETTINGS,
      ScreenshotFactory.THUMB_SIZE,
      screenshot
    );

    const url = UrlFactory.newUrl();

    const pdfData: Omit<ObjPdfDataDto, 'hash'> = {
      screenshot,
      rawUrl: this.value.url,
      url
    };
    const pdfDataHash = fnSha256Object(pdfData);
    const data: ObjPdfDto = {
      hash,
      data: { ...pdfData, hash: pdfDataHash }
    };

    const dto: ObjDto<ObjPdfDto> = {
      id,
      type: ObjTypeDto.Pdf,
      createdAt: dt,
      updatedAt: dt,
      data,
      version: OBJ_DTO_VERSION,
      local: {}
    };

    await BrowserStorage.set(`${ObjectStoreKeys.PDF_DATA}:${hash}`, this.value.data);

    const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;
    await BrowserStorage.set(key, dto);
    await LinkHrefStore.add(url, id);

    await new ObjAddIdCommand({ id, dt }, ObjectStoreKeys.OBJECT_LIST).execute();
  }
}
