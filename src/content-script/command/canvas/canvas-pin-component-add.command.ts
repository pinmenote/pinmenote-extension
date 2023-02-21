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
import { CanvasPinComponent } from '../../components/canvas-pin.component';
import { HtmlComponent } from '../../../common/model/html.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjCanvasPinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { PinStore } from '../../store/pin.store';

export class CanvasPinComponentAddCommand implements ICommand<HtmlComponent<HTMLElement> | undefined> {
  constructor(private dto: ObjDto<ObjCanvasPinDto>, private focus = false) {}
  execute(): HtmlComponent<HTMLElement> | undefined {
    const component = new CanvasPinComponent(this.dto);
    component.render();
    return PinStore.add(component);
  }
}
