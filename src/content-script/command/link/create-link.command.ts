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
import { HtmlLinkComponent } from '../../components/html-link.component';
import { ObjectTypeDto } from '../../../common/model/html.model';
import { PinPendingStore } from '../../store/pin-pending.store';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnFindElementXpath } from '../../../common/fn/xpath.fn';
import { fnUid } from '../../../common/fn/uid.fn';
import { isElementHidden } from '../../fn/is-element-hidden';
import ICommand = Pinmenote.Common.ICommand;
import LinkDto = Pinmenote.Pin.LinkDto;

export class CreateLinkCommand implements ICommand<boolean> {
  constructor(private link: LinkDto) {}
  execute(): boolean {
    if (this.link.url.href !== window.location.href) return false;
    const value = fnFindElementXpath(this.link.locator.xpath);
    const ref = value.singleNodeValue as HTMLElement;
    const uid = fnUid();
    const object = { uid, type: ObjectTypeDto.Link, ...this.link };
    fnConsoleLog('CreateLinkCommand->ref', ref, this.link);
    if (!ref || isElementHidden(ref)) {
      PinPendingStore.add(object);
      return false;
    }
    const pinComponent = new HtmlLinkComponent(ref, object);
    document.body.appendChild(pinComponent.render());
    pinComponent.focus(true);
    return true;
  }
}
