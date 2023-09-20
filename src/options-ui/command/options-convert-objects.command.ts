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
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../common/model/shared/common.dto';
import { ObjDto, ObjTypeDto } from '../../common/model/obj/obj.dto';
import { ObjectStoreKeys } from '../../common/keys/object.store.keys';
import { ObjPageDto } from '../../common/model/obj/obj-page.dto';
import { ImageResizeFactory } from '../../common/factory/image-resize.factory';
import { ScreenshotFactory } from '../../common/factory/screenshot.factory';
import { fnConsoleLog } from '../../common/fn/fn-console';

export class OptionsConvertObjectsCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    await this.convertSnapshots();
  }

  private async convertSnapshots(): Promise<void> {
    let listId = await BrowserStorage.get<number>(ObjectStoreKeys.OBJECT_LIST_ID);
    while (listId > 0) {
      fnConsoleLog('listId', listId);
      const list = await BrowserStorage.get<number[]>(`${ObjectStoreKeys.OBJECT_LIST}:${listId}`);
      for (const id of list) {
        const obj = await BrowserStorage.get<ObjDto>(`${ObjectStoreKeys.OBJECT_ID}:${id}`);
        switch (obj.type) {
          case ObjTypeDto.PageSnapshot:
          case ObjTypeDto.PageElementSnapshot:
            await this.convertSnapshot(obj as ObjDto<ObjPageDto>);
            break;
        }
      }
      listId -= 1;
    }
  }

  private async convertSnapshot(obj: ObjDto<ObjPageDto>) {
    const screenshot = await ImageResizeFactory.resize2(
      document,
      ScreenshotFactory.THUMB_SETTINGS,
      ScreenshotFactory.THUMB_SIZE,
      obj.data.snapshot.data.screenshot
    );
    console.log('id', obj.id, 'before', obj.data.snapshot.data.screenshot.length, 'after', screenshot.length);
    if (screenshot.length < obj.data.snapshot.data.screenshot.length) {
      obj.data.snapshot.data.screenshot = screenshot;
      await BrowserStorage.set<ObjDto>(`${ObjectStoreKeys.OBJECT_ID}:${obj.id}`, obj);
    }
    //
  }
}
