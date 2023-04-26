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
import { ObjSnapshotContentDto, ObjVideoDataDto } from '../../../common/model/obj/obj-snapshot.dto';
import { AutoTagMediator } from '../../mediator/auto-tag.mediator';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { CssFactory } from '../../factory/css.factory';
import { HtmlFactory } from '../../factory/html/html.factory';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjNextContentIdCommand } from '../../../common/command/obj/content/obj-next-content-id.command';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/console.fn';

interface SnapshotResult {
  id: number;
  words: string[];
  video: ObjVideoDataDto[];
}

export class SnapshotContentSaveCommand implements ICommand<Promise<SnapshotResult>> {
  constructor(private element: HTMLElement, private isPartial = true) {}
  async execute(): Promise<SnapshotResult> {
    const id = await new ObjNextContentIdCommand().execute();
    const key = `${ObjectStoreKeys.CONTENT_ID}:${id}`;

    fnConsoleLog('START', key);
    const urlCache = new Set<string>();
    const htmlContent = await HtmlFactory.computeHtmlIntermediateData({
      ref: this.element,
      depth: 1,
      skipTagCache: new Set<string>(),
      skipUrlCache: urlCache,
      isPartial: this.isPartial
    });
    const html = HtmlFactory.computeHtmlParent(this.element.parentElement, htmlContent.html, this.isPartial);
    const htmlAttr = HtmlFactory.computeHtmlAttr();
    fnConsoleLog('HTML DONE');
    const css = await CssFactory.computeCssContent(urlCache);
    fnConsoleLog('CSS DONE');
    const words = AutoTagMediator.computeTags(this.element);
    fnConsoleLog('TAGS DONE');
    fnConsoleLog('SKIPPED', urlCache);
    fnConsoleLog('END');

    await BrowserStorageWrapper.set<ObjSnapshotContentDto>(key, {
      id,
      html,
      htmlAttr,
      css,
      content: htmlContent.content
    });

    return { id, words, video: htmlContent.video };
  }
}
