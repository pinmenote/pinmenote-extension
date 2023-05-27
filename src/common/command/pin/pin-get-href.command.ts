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
import { ObjDto, ObjUrlDto } from '../../model/obj/obj.dto';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefOriginStore } from '../../store/link-href-origin.store';
import { ObjPinDto } from '../../model/obj/obj-pin.dto';
import { ObjPinGetCommand } from '../obj/obj-pin-get.command';
import { fnConsoleLog } from '../../fn/fn-console';

export class PinGetHrefCommand implements ICommand<Promise<ObjDto<ObjPinDto>[]>> {
  constructor(private data: ObjUrlDto) {}

  async execute(): Promise<ObjDto<ObjPinDto>[]> {
    const pinIds = (await LinkHrefOriginStore.pinIds(this.data.href)).reverse();
    fnConsoleLog('PinGetHrefCommand->execute', this.data.href, 'ids->', pinIds);
    const out: ObjDto<ObjPinDto>[] = [];

    for (const id of pinIds) {
      const obj = await new ObjPinGetCommand<ObjPinDto>(id).execute();
      // TODO revisit visible flag in pin.manager.ts in content scripts
      if (!obj.local?.visible) continue;
      out.push(obj);
    }
    return out;
  }
}
