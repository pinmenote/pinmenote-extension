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
import { AutoTagMediator } from '../../mediator/auto-tag.mediator';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ContentSnapshotAddCommand } from '../../../common/command/snapshot/content-snapshot-add.command';
import { CssFactory } from '../../factory/css.factory';
import { HtmlConstraints } from '../../factory/html/html.constraints';
import { HtmlFactory } from '../../factory/html/html.factory';
import { HtmlSkipAttribute } from '../../model/html.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjNextIdCommand } from '../../../common/command/obj/id/obj-next-id.command';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSha256 } from '../../../common/fn/fn-sha256';

interface SnapshotResult {
  id: number;
  words: string[];
}

export class SnapshotContentSaveCommand implements ICommand<Promise<SnapshotResult>> {
  private savedHash = new Set<string>();

  constructor(private element: HTMLElement, private skipAttributes: HtmlSkipAttribute[], private isPartial = true) {}
  async execute(): Promise<SnapshotResult> {
    const id = await new ObjNextIdCommand(ObjectStoreKeys.CONTENT_ID).execute();
    const key = `${ObjectStoreKeys.CONTENT_ID}:${id}`;

    fnConsoleLog('START', key, window.location.href);
    const skipAttributes = HtmlConstraints.SKIP_URLS[location.hostname] || [];
    skipAttributes.push(...this.skipAttributes);
    const urlCache = new Set<string>();
    const params = {
      ref: this.element,
      depth: 1,
      skipAttributes,
      visitedUrl: {},
      skipTagCache: new Set<string>(),
      skipUrlCache: urlCache,
      isPartial: this.isPartial,
      insideLink: this.element.tagName.toLowerCase() === 'a',
      contentCallback: this.contentCallback
    };

    const htmlContent = await HtmlFactory.computeHtmlIntermediateData(params);
    const html = HtmlFactory.computeHtmlParent(this.element.parentElement, htmlContent.html, this.isPartial);
    const htmlAttr = HtmlFactory.computeHtmlAttr();

    fnConsoleLog('HTML DONE', htmlAttr);
    const css = await CssFactory.computeCssContent(document, params);

    const adopted = CssFactory.computeAdoptedStyleSheets(document.adoptedStyleSheets);
    if (adopted) css.css.unshift({ hash: fnSha256(adopted), data: adopted });

    fnConsoleLog('CSS DONE');
    const words = AutoTagMediator.computeTags(this.element);
    fnConsoleLog('TAGS DONE');
    fnConsoleLog('SKIPPED', urlCache);
    fnConsoleLog('END');

    await BrowserStorageWrapper.set<ObjSnapshotContentDto>(key, {
      hash: fnSha256(html),
      html,
      htmlAttr,
      css,
      hashes: Array.from(new Set<string>(htmlContent.hashes))
    });

    return { id, words };
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
