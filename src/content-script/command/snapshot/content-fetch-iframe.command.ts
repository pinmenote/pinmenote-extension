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
import { HtmlFactory } from '../../factory/html/html.factory';
import { ICommand } from '../../../common/model/shared/common.dto';
import { IFrameMessage } from '../../../common/model/iframe-message.model';
import { ObjIframeContentDto } from '../../../common/model/obj/obj-content.dto';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class ContentFetchIframeCommand implements ICommand<Promise<void>> {
  constructor(private msg: IFrameMessage, private href: string) {}

  async execute(): Promise<void> {
    fnConsoleLog('ContentFetchIframeCommand->execute', this.msg);
    const htmlContent = await HtmlFactory.computeHtmlIntermediateData({
      ref: document.body,
      depth: (this.msg.data.depth as number) + 1,
      skipUrlCache: new Set<string>(),
      skipTagCache: new Set<string>(),
      isPartial: false
    });
    fnConsoleLog('ContentFetchIframeCommand->html->done');
    const css = await CssFactory.computeCssContent();
    fnConsoleLog('ContentFetchIframeCommand->css->done');
    const dto: ObjIframeContentDto = {
      ok: true,
      uid: this.msg.uid,
      url: this.href,
      html: htmlContent.html,
      htmlAttr: HtmlFactory.computeHtmlAttr(),
      css,
      content: htmlContent.content
    };
    await BrowserApi.sendRuntimeMessage<IFrameMessage>({
      type: BusMessageType.CONTENT_IFRAME_MESSAGE,
      data: {
        type: this.msg.type,
        uid: this.msg.uid,
        keep: this.msg.keep,
        data: dto
      }
    });
  }
}
