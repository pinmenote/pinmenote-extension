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
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { HtmlImgFactory } from '../../factory/html/html-img.factory';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjNextIdCommand } from '../../../common/command/obj/id/obj-next-id.command';
import { ObjSnapshotContentDto } from '../../../common/model/obj/obj-snapshot.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';

export class SnapshotSaveImageCommand implements ICommand<Promise<number>> {
  constructor(private element: HTMLElement) {}

  async execute(): Promise<number> {
    const id = await new ObjNextIdCommand(ObjectStoreKeys.CONTENT_ID).execute();
    const key = `${ObjectStoreKeys.CONTENT_ID}:${id}`;

    const value = await HtmlImgFactory.computeImgValue(this.element as HTMLImageElement);

    await BrowserStorageWrapper.set<ObjSnapshotContentDto>(key, {
      id,
      html: `<img src="${value}" />`,
      htmlAttr: '',
      css: {
        css: []
      },
      content: []
    });
    return id;
  }
}
