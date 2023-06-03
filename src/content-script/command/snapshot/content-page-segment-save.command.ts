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
import { PageSegmentDto, SegmentTypeDto } from '../../../common/model/obj/page-segment.dto';
import { AutoTagMediator } from '../../mediator/auto-tag.mediator';
import { CssFactory } from '../../factory/css.factory';
import { HtmlConstraints } from '../../factory/html/html.constraints';
import { HtmlFactory } from '../../factory/html/html.factory';
import { HtmlSkipAttribute } from '../../model/html.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { PageSegmentAddCommand } from '../../../common/command/snapshot/segment/page-segment-add.command';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnSha256 } from '../../../common/fn/fn-sha256';

interface SnapshotResult {
  hash: string;
  words: string[];
}

export class ContentPageSegmentSaveCommand implements ICommand<Promise<SnapshotResult>> {
  private savedHash = new Set<string>();

  constructor(private element: HTMLElement, private skipAttributes: HtmlSkipAttribute[], private isPartial = true) {}
  async execute(): Promise<SnapshotResult> {
    fnConsoleLog('SnapshotContentSaveCommand->START', window.location.href);
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
    const adoptedHash = fnSha256(adopted);
    css.unshift(adoptedHash);
    await this.contentCallback({
      hash: adoptedHash,
      type: SegmentTypeDto.CSS,
      content: {
        data: adopted
      }
    });

    fnConsoleLog('CSS DONE');
    const words = AutoTagMediator.computeTags(this.element);
    fnConsoleLog('TAGS DONE');
    fnConsoleLog('SKIPPED', urlCache);
    fnConsoleLog('END');

    const hash = fnSha256(html);
    await this.contentCallback({
      hash,
      type: SegmentTypeDto.SNAPSHOT,
      content: {
        html: {
          hash,
          html,
          htmlAttr
        },
        css,
        assets: Array.from(new Set<string>(htmlContent.assets))
      }
    });
    return { hash, words };
  }

  private contentCallback = async (content: PageSegmentDto) => {
    if (this.savedHash.has(content.hash)) {
      fnConsoleLog('SnapshotContentSaveCommand->DUPLICATE', content.hash, content);
      return;
    }
    this.savedHash.add(content.hash);
    await new PageSegmentAddCommand(content).execute();
  };
}
