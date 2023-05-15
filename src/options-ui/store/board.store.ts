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
import { ObjDto, ObjTypeDto } from '../../common/model/obj/obj.dto';
import { ObjPageDto, ObjPagePinDto } from '../../common/model/obj/obj-pin.dto';
import { BrowserStorageWrapper } from '../../common/service/browser.storage.wrapper';
import { ObjRangeRequest } from 'src/common/model/obj-request.model';
import { ObjectStoreKeys } from '../../common/keys/object.store.keys';
import { OptionsObjGetRangeCommand } from '../../service-worker/command/options/options-obj-get-range.command';
import { OptionsObjSearchCommand } from '../../service-worker/command/options/options-obj-search.command';
import { PageSnapshotRemoveCommand } from '../../common/command/snapshot/page-snapshot-remove.command';
import { PinRemoveCommand } from '../../common/command/pin/pin-remove.command';
import { fnConsoleLog } from '../../common/fn/console.fn';

export class BoardStore {
  static objData: ObjDto[] = [];

  private static loading = false;
  private static isLastValue = false;
  private static readonly search: ObjRangeRequest = {
    from: -1,
    limit: 10,
    listId: -1
  };

  static get objList(): ObjDto[] {
    return this.objData;
  }

  static removeObj = async (value: ObjDto): Promise<boolean> => {
    for (let i = 0; i < this.objData.length; i++) {
      if (this.objData[i].id == value.id) {
        this.objData.splice(i, 1);
        if (value.type === ObjTypeDto.PageElementPin) {
          await new PinRemoveCommand(value as ObjDto<ObjPagePinDto>).execute();
        } else if (value.type === ObjTypeDto.PageSnapshot || value.type === ObjTypeDto.PageElementSnapshot) {
          await new PageSnapshotRemoveCommand(value as ObjDto<ObjPageDto>).execute();
        }
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
    this.search.from = (await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.OBJECT_ID)) || 1;
    this.search.search = undefined;
    this.search.listId = (await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.OBJECT_LIST_ID)) || 1;
  }

  static setLoading(value: boolean): void {
    this.loading = value;
  }

  static get isLoading(): boolean {
    return this.loading;
  }

  static timeout?: number;

  static setSearch(search?: string): void {
    this.search.search = search;
  }

  static getSearch(): string | undefined {
    return this.search.search;
  }

  static async getObjRange(refreshBoardCallback: () => void): Promise<void> {
    fnConsoleLog('PinBoardStore->getRange', this.search);
    this.loading = true;
    const result = await new OptionsObjGetRangeCommand(this.search).execute();
    if (result && result.data.length > 0) {
      const lastResultObj = result.data[result.data.length - 1];
      const firstResultObj = result.data[0];
      const lastObj = this.objData[this.objData.length - 1];
      if (lastObj?.id === firstResultObj.id) {
        result.data.shift();
        fnConsoleLog('PinBoardStore->getRange->UNSHIFT', result.data);
      }

      if (result.data.length === 0) {
        this.isLastValue = true;
        fnConsoleLog('PinBoardStore->getRange->STOP', lastResultObj.id);
        return;
      }

      this.search.listId = result.listId;
      this.search.from = lastResultObj.id;

      this.objData.push(...result.data);

      refreshBoardCallback();
    } else {
      this.isLastValue = true;
    }
    this.loading = false;
  }

  static async sendSearch(refreshBoardCallback: () => void): Promise<void> {
    fnConsoleLog('PinBoardStore->getSearch', this.search);
    const result = await new OptionsObjSearchCommand(this.search).execute();
    if (result) {
      this.objData.push(...result);
      refreshBoardCallback();
    }
  }
}
