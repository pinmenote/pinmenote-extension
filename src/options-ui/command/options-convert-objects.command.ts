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
import { fnConsoleLog } from '../../common/fn/fn-console';
import { ObjPageNoteDto } from '../../common/model/obj/obj-note.dto';
import { ObjPdfDto } from '../../common/model/obj/obj-pdf.dto';

export class OptionsConvertObjectsCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    await this.convertSnapshots();
  }

  private async convertSnapshots(): Promise<void> {
    fnConsoleLog('OptionsConvertObjectsCommand->START');
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
          case ObjTypeDto.PageNote:
            await this.convertPageNote(obj as ObjDto<ObjPageNoteDto>);
            break;
          case ObjTypeDto.Pdf:
            await this.convertPdf(obj as ObjDto<ObjPdfDto>);
            break;
        }
      }
      listId -= 1;
    }
    fnConsoleLog('OptionsConvertObjectsCommand->END');
  }

  private async convertPdf(obj: ObjDto<ObjPdfDto>) {
    delete obj.data.data['hashtags'];
    await BrowserStorage.set<ObjDto>(`${ObjectStoreKeys.OBJECT_ID}:${obj.id}`, obj);
  }

  private async convertPageNote(obj: ObjDto<ObjPageNoteDto>) {
    delete obj.data.data['hashtags'];
    await BrowserStorage.set<ObjDto>(`${ObjectStoreKeys.OBJECT_ID}:${obj.id}`, obj);
  }

  private async convertSnapshot(obj: ObjDto<ObjPageDto>) {
    delete obj.data.snapshot.info['hashtags'];
    await BrowserStorage.set<ObjDto>(`${ObjectStoreKeys.OBJECT_ID}:${obj.id}`, obj);
    //
  }
}
