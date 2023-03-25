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
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { CssFactory } from '../../factory/css.factory';
import { FetchIframeRequest } from '../../../common/model/obj-request.model';
import { HtmlFactory } from '../../factory/html.factory';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjIframeContentDto } from '../../../common/model/obj/obj-iframe.dto';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class ContentFetchIframeCommand implements ICommand<Promise<void>> {
  constructor(private data: FetchIframeRequest, private href: string) {}

  async execute(): Promise<void> {
    fnConsoleLog('ContentFetchIframeCommand->execute', this.data);
    const htmlContent = await HtmlFactory.computeHtmlIntermediateData(document.body, this.data.depth + 1);
    const css = await CssFactory.computeCssContent();
    const dto: ObjIframeContentDto = {
      ok: true,
      id: this.data.id,
      url: this.href,
      html: htmlContent.html,
      css
    };
    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.CONTENT_FETCH_IFRAME_RESULT, data: dto });
  }
}
