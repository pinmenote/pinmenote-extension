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
import { HtmlComponent } from '../../../common/model/html.model';
import { PinComponent } from '../../components/pin.component';
import { PinObject } from '../../../common/model/pin.model';
import { PinStore } from '../../store/pin.store';
import ICommand = Pinmenote.Common.ICommand;

export class PinComponentAddCommand implements ICommand<HtmlComponent | undefined> {
  constructor(private ref: HTMLElement, private dto: PinObject, private focus = false) {}
  execute(): HtmlComponent | undefined {
    const pinComponent = new PinComponent(this.ref, this.dto);
    pinComponent.render();
    if (this.focus) pinComponent.focus();

    // Add Pin data
    return PinStore.add(pinComponent);
  }
}
