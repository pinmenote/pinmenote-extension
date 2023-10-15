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
import { PageCompute, PageSkipAttribute, SegmentData } from '@pinmenote/page-compute';
import { HtmlConstraints } from '../../factory/html/html.constraints';
import { ICommand } from '../../../common/model/shared/common.dto';
import { IFrameStore } from '../../store/iframe.store';
import { PageSegmentAddCommand } from '../../../common/command/snapshot/segment/page-segment-add.command';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { DocumentStore } from '../../store/document.store';

export class ContentPageSegmentSaveCommand implements ICommand<Promise<string>> {
  private savedHash = new Set<string>();

  constructor(private element: HTMLElement, private skipAttributes: PageSkipAttribute[], private isPartial = true) {}
  async execute(): Promise<string> {
    fnConsoleLog('SnapshotContentSaveCommand->START', window.location.href);
    const skipAttributes = HtmlConstraints.SKIP_URLS[location.hostname] || [];
    skipAttributes.push(...this.skipAttributes);

    const snapshot = await PageCompute.compute(
      this.element,
      DocumentStore.getInstance().cache,
      this.contentCallback,
      IFrameStore.getInstance(),
      skipAttributes,
      TinyDispatcher.getInstance(),
      this.isPartial
    );
    await this.contentCallback(snapshot);
    return snapshot.hash;
  }

  private contentCallback = async (content: SegmentData) => {
    if (this.savedHash.has(content.hash)) {
      fnConsoleLog('SnapshotContentSaveCommand->DUPLICATE', content.hash, content);
      return;
    }
    this.savedHash.add(content.hash);
    await new PageSegmentAddCommand(content).execute();
  };
}
