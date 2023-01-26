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
import { ObjLinkDto } from '../../../common/model/obj.model';
import { ObjectTypeDto } from '../../../common/model/html.model';
import { PinPendingStore } from '../../store/pin-pending.store';
import { XpathFactory } from '../../../common/factory/xpath.factory';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnUid } from '../../../common/fn/uid.fn';
import { isElementHiddenFn } from '../../fn/is-element-hidden.fn';
import ICommand = Pinmenote.Common.ICommand;

export class CreateLinkCommand implements ICommand<boolean> {
  constructor(private link: ObjLinkDto) {}
  execute(): boolean {
    if (this.link.url.href !== window.location.href) return false;
    if (!this.link.xpath) return true;
    const value = XpathFactory.newXPathResult(this.link.xpath);
    const ref = value.singleNodeValue as HTMLElement;
    const rect = XpathFactory.computeRect(ref);
    const uid = fnUid();
    const dt = new Date().toISOString();
    const object = {
      xpath: this.link.xpath,
      url: this.link.url,
      uid,
      type: ObjectTypeDto.Link,
      rect,
      updatedAt: dt,
      createdAt: dt,
      value: ''
    };
    fnConsoleLog('CreateLinkCommand->ref', ref, this.link);
    if (!ref || isElementHiddenFn(ref)) {
      PinPendingStore.add(object);
      return false;
    }
    const pinComponent = new HtmlLinkComponent(ref, object);
    document.body.appendChild(pinComponent.render());
    pinComponent.focus(true);
    return true;
  }
}
