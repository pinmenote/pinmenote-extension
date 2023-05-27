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
import { HtmlComponent } from '../../model/html.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import { PinComponent } from '../../components/pin.component';
import { PinStore } from '../../store/pin.store';

export class PinComponentAddCommand implements ICommand<HtmlComponent<HTMLElement> | undefined> {
  constructor(private ref: HTMLElement, private dto: ObjDto<ObjPinDto>, private focus = false) {}
  execute(): HtmlComponent<HTMLElement> | undefined {
    const pinComponent = new PinComponent(this.ref, this.dto);
    pinComponent.render();
    if (this.focus) pinComponent.focus();

    // Add Pin data
    return PinStore.add(pinComponent);
  }
}
