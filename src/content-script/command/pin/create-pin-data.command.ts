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
import { DocumentMediator } from '../../mediator/document.mediator';
import { HtmlComponent } from '../../../common/model/html.model';
import { PinComponent } from '../../components/pin.component';
import { PinObject } from '../../../common/model/pin.model';
import { PinStore } from '../../store/pin.store';
import { SettingsStore } from '../../store/settings.store';
import { contentPinNew } from '../../fn/content-pin-new';
import ICommand = Pinmenote.Common.ICommand;
import PinPoint = Pinmenote.Pin.PinPoint;

export class CreatePinDataCommand implements ICommand<Promise<HtmlComponent | undefined>> {
  constructor(private ref: HTMLElement, private offset: PinPoint, private dto?: PinObject) {}
  async execute(): Promise<HtmlComponent | undefined> {
    let shouldFocus = false;
    if (!this.dto) {
      this.dto = await contentPinNew(this.ref, this.offset);
      shouldFocus = true;
      DocumentMediator.stopListeners();
    }
    // TODO !!! CHANGE HTMLElements to interfaces
    const pinComponent = new PinComponent(this.ref, this.dto);
    document.body.appendChild(pinComponent.render());

    if (shouldFocus) pinComponent.focus();

    this.ref.style.border = SettingsStore.borderStyle;
    this.ref.style.borderRadius = SettingsStore.borderRadius;

    // Add Pin data
    return PinStore.add(pinComponent);
  }
}
