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
import { ObjDataDto, ObjDto, ObjTypeDto } from '../../common/model/obj/obj.dto';
import { BrowserStorage } from '@pinmenote/browser-api';
import { ObjPageDto } from '../../common/model/obj/obj-page.dto';
import { ObjPageNoteDto } from '../../common/model/obj/obj-note.dto';
import { ObjPdfDto } from '../../common/model/obj/obj-pdf.dto';
import { ObjRangeRequest } from '../../common/model/obj-request.model';
import { ObjectStoreKeys } from '../../common/keys/object.store.keys';
import { OptionsObjGetRangeCommand } from '../command/options-obj-get-range.command';
import { PageNoteRemoveCommand } from '../../common/command/page-note/page-note-remove.command';
import { PageSnapshotRemoveCommand } from '../../common/command/snapshot/page-snapshot-remove.command';
import { PdfRemoveCommand } from '../../common/command/pdf/pdf-remove.command';
import { fnConsoleLog } from '../../common/fn/fn-console';
import { ObjGetCommand } from '../../common/command/obj/obj-get.command';

export class BoardStore {
  static objData: ObjDto[] = [];
  static keySet = new Set<number>();

  private static loading = false;
  private static modeTags = false;
  private static isLastValue = false;
  private static readonly rangeRequest: ObjRangeRequest = {
    from: -1,
    limit: 10,
    listId: -1,
    search: ''
  };
  private static refreshBoardCallback?: () => void;

  static get objList(): ObjDto[] {
    return this.objData;
  }

  static get search(): string {
    return this.rangeRequest.search;
  }

  static set search(value: string) {
    if (this.modeTags) return;
    if (this.rangeRequest.search.length > 0) {
      this.rangeRequest.from = -1;
      this.rangeRequest.listId = -1;
      this.objData = [];
      this.keySet.clear();
      if (this.refreshBoardCallback) this.refreshBoardCallback();
    }
    this.rangeRequest.search = value;
    this.isLastValue = false;
  }

  static removeObj = async (value: ObjDto): Promise<boolean> => {
    for (let i = 0; i < this.objData.length; i++) {
      if (this.objData[i].id == value.id) {
        switch (value.type) {
          case ObjTypeDto.PageSnapshot:
          case ObjTypeDto.PageElementSnapshot: {
            await new PageSnapshotRemoveCommand(value as ObjDto<ObjPageDto>).execute();
            break;
          }
          case ObjTypeDto.Pdf: {
            await new PdfRemoveCommand(value as ObjDto<ObjPdfDto>).execute();
            break;
          }
          case ObjTypeDto.PageNote:
            await new PageNoteRemoveCommand(value as ObjDto<ObjPageNoteDto>).execute();
            break;
          default: {
            fnConsoleLog('removeObj->NOT SUPPORTED');
            break;
          }
        }
        this.keySet.delete(value.id);
        this.objData.splice(i, 1);
        return true;
      }
    }
    return false;
  };

  static get isLast(): boolean {
    return this.isLastValue;
  }

  static async clearSearch(): Promise<void> {
    this.isLastValue = false;
    this.rangeRequest.search = '';
    this.rangeRequest.from = (await BrowserStorage.get<number | undefined>(ObjectStoreKeys.OBJECT_ID)) || 1;
    this.rangeRequest.listId = -1;
    this.objData = [];
    this.keySet.clear();
  }

  static timeout?: number;

  static setRefreshCallback = (refreshBoardCallback: () => void) => {
    this.refreshBoardCallback = refreshBoardCallback;
  };

  static async setTags(tags: string[]): Promise<void> {
    this.modeTags = true;
    // clear
    this.objData = [];
    this.keySet.clear();

    const a = Date.now();
    for (const tag of tags) {
      const tagObjIds = await BrowserStorage.get<number[]>(`${ObjectStoreKeys.TAG_INDEX}:${tag}`);
      const ids = tagObjIds.reverse();
      for (const id of ids) {
        const obj = await new ObjGetCommand<ObjDataDto>(id).execute();
        if (this.keySet.has(obj.id)) continue;
        this.objData.push(obj);
        this.keySet.add(obj.id);
      }
    }
    fnConsoleLog('setTags in', Date.now() - a);
    this.isLastValue = true;
    if (this.refreshBoardCallback) this.refreshBoardCallback();
  }

  static async clearTags() {
    this.modeTags = false;
    this.isLastValue = false;
    this.objData = [];
    this.keySet.clear();
    this.rangeRequest.from = -1;
    this.rangeRequest.listId = -1;
    await this.getObjRange();
  }

  static async getObjRange(): Promise<void> {
    if (this.modeTags) return;
    if (this.loading) return;
    this.loading = true;
    const a = Date.now();
    const result = await new OptionsObjGetRangeCommand(this.rangeRequest).execute();
    fnConsoleLog('getObjRange', this.rangeRequest, this.isLastValue, result?.data, 'in', Date.now() - a);
    if (result && result.data.length > 0) {
      const lastResultObj = result.data[result.data.length - 1];

      this.rangeRequest.listId = result.listId;
      this.rangeRequest.from = lastResultObj.id;

      let added = false;
      for (const obj of result.data) {
        if (this.keySet.has(obj.id)) continue;
        added = true;
        this.objData.push(obj);
        this.keySet.add(obj.id);
      }
      if (!added) this.isLastValue = true;

      if (this.refreshBoardCallback) this.refreshBoardCallback();
    } else {
      this.isLastValue = true;
    }
    this.loading = false;
  }
}
