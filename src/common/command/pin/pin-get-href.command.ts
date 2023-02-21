/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { ObjDto, ObjUrlDto } from '../../model/obj/obj.dto';
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefOriginStore } from '../../store/link-href-origin.store';
import { ObjPagePinDto } from '../../model/obj/obj-pin.dto';
import { ObjectStoreKeys } from '../../keys/object.store.keys';
import { fnConsoleLog } from '../../fn/console.fn';

export class PinGetHrefCommand implements ICommand<Promise<ObjDto<ObjPagePinDto>[]>> {
  constructor(private data: ObjUrlDto, private filterVisible = false) {}

  async execute(): Promise<ObjDto<ObjPagePinDto>[]> {
    const pinIds = (await LinkHrefOriginStore.hrefIds(this.data.href)).reverse();
    fnConsoleLog('WorkerPinManager->pinGetHref', this.data.href, 'ids->', pinIds);
    // await this.test();
    const out: ObjDto<ObjPagePinDto>[] = [];
    for (const id of pinIds) {
      const key = `${ObjectStoreKeys.OBJECT_ID}:${id}`;
      const obj = await BrowserStorageWrapper.get<ObjDto<ObjPagePinDto>>(key);
      // TODO revisit visible flag in pin.manager.ts in content scripts
      if (this.filterVisible && !obj.local?.visible) continue;
      out.push(obj);
    }
    return out;
  }
}
