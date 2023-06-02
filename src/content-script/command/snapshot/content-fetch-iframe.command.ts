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
import { ObjContentDto, ObjSnapshotContentDto } from '../../../common/model/obj/obj-content.dto';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ContentSnapshotAddCommand } from '../../../common/command/snapshot/content-snapshot-add.command';
import { CssFactory } from '../../factory/css.factory';
import { HtmlFactory } from '../../factory/html/html.factory';
import { ICommand } from '../../../common/model/shared/common.dto';
import { IFrameFetchMessage } from '../../../common/model/iframe-message.model';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnIframeIndex } from '../../../common/fn/fn-iframe-index';
import { fnSha256 } from '../../../common/fn/fn-sha256';

export class ContentFetchIframeCommand implements ICommand<Promise<void>> {
  private savedHash = new Set<string>();

  constructor(private href: string, private uid: string, private depth: number) {}

  async execute(): Promise<void> {
    fnConsoleLog(
      'ContentFetchIframeCommand->execute',
      this.href,
      this.uid,
      this.depth,
      'children',
      document.body.children.length
    );

    const params = {
      ref: document.body,
      depth: this.depth + 1,
      skipAttributes: [],
      visitedUrl: {},
      skipUrlCache: new Set<string>(),
      skipTagCache: new Set<string>(),
      isPartial: false,
      insideLink: false,
      contentCallback: this.contentCallback
    };

    const htmlContent = await HtmlFactory.computeHtmlIntermediateData(params);
    fnConsoleLog('ContentFetchIframeCommand->html->done');

    const css = await CssFactory.computeCssContent(document, params);
    fnConsoleLog('ContentFetchIframeCommand->css->done');

    const dto: ObjSnapshotContentDto = {
      hash: fnSha256(htmlContent.html),
      html: htmlContent.html,
      htmlAttr: HtmlFactory.computeHtmlAttr(),
      css,
      hashes: Array.from(new Set<string>(htmlContent.hashes))
    };
    const index = fnIframeIndex();
    await BrowserApi.sendRuntimeMessage<IFrameFetchMessage>({
      type: BusMessageType.IFRAME_FETCH_RESULT,
      data: {
        index,
        uid: this.uid,
        href: this.href,
        data: dto
      }
    });
  }

  private contentCallback = async (content: ObjContentDto) => {
    if (this.savedHash.has(content.hash)) {
      fnConsoleLog('SnapshotContentSaveCommand->DUPLICATE', content.hash, content);
      return;
    }
    this.savedHash.add(content.hash);
    await new ContentSnapshotAddCommand(content).execute();
  };
}
