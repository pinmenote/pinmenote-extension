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
import { PageCompute, PageComputeMessage, SegmentData, SegmentPage } from '@pinmenote/page-compute';
import { BrowserApi } from '@pinmenote/browser-api';
import { ICommand } from '../../../common/model/shared/common.dto';
import { IFrameFetchMessage } from '../../../common/model/iframe-message.model';
import { IFrameStore } from '../../store/iframe.store';
import { PageSegmentAddCommand } from '../../../common/command/snapshot/segment/page-segment-add.command';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { fnConsoleLog } from '../../../common/fn/fn-console';
import { fnIframeIndex } from '../../../common/fn/fn-iframe-index';
import { DocumentStore } from '../../store/document.store';

export class ContentFetchIframeCommand implements ICommand<Promise<void>> {
  private savedHash = new Set<string>();

  constructor(private href: string, private uid: string) {}

  async execute(): Promise<void> {
    fnConsoleLog('ContentFetchIframeCommand->execute', this.href, this.uid, 'children', document.body.children.length);
    const snapshot = await PageCompute.compute(
      document.body,
      DocumentStore.getInstance().cache,
      this.contentCallback,
      IFrameStore.getInstance(),
      [],
      TinyDispatcher.getInstance(),
      false
    );

    const dto: SegmentPage = {
      html: snapshot.content.html,
      css: snapshot.content.css,
      assets: snapshot.content.assets
    };
    const index = fnIframeIndex();
    await BrowserApi.sendRuntimeMessage<IFrameFetchMessage>({
      type: PageComputeMessage.IFRAME_FETCH_RESULT,
      data: {
        index,
        uid: this.uid,
        href: this.href,
        data: dto
      }
    });
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
