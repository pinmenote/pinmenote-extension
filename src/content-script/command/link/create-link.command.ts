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
import { ObjDto, ObjLinkDto } from '../../../common/model/obj.model';
import { HtmlLinkComponent } from '../../components/html-link.component';
import { ICommand } from '../../../common/model/shared/common.dto';
import { PinPendingStore } from '../../store/pin-pending.store';
import { XpathFactory } from '../../../common/factory/xpath.factory';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { isElementHiddenFn } from '../../fn/is-element-hidden.fn';

export class CreateLinkCommand implements ICommand<boolean> {
  constructor(private data: ObjDto<ObjLinkDto>) {}
  execute(): boolean {
    const link = this.data.data;
    if (link.url.href !== window.location.href) return false;
    const value = XpathFactory.newXPathResult(link.xpath);
    const ref = value.singleNodeValue as HTMLElement;
    fnConsoleLog('CreateLinkCommand->ref', ref, this.data);
    if (!ref || isElementHiddenFn(ref)) {
      PinPendingStore.add(this.data);
      return false;
    }
    const pinComponent = new HtmlLinkComponent(ref, this.data);
    document.body.appendChild(pinComponent.render());
    pinComponent.focus(true);
    return true;
  }
}
