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
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { PinStore } from '../../store/pin.store';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class PinNavigateCommand implements ICommand<void> {
  constructor(private data: ObjDto<ObjPagePinDto>) {}
  execute(): void {
    fnConsoleLog('PinNavigateCommand->execute', this.data);

    PinStore.focusPin(this.data);
  }
}
