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
import { AutoTagMediator } from '../../mediator/auto-tag.mediator';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { CssFactory } from '../../factory/css.factory';
import { HtmlFactory } from '../../factory/html.factory';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjCanvasDto } from '../../../common/model/obj/obj-snapshot.dto';
import { ObjNextContentIdCommand } from '../../../common/command/obj/content/obj-next-content-id.command';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class SnapshotContentSaveCommand implements ICommand<Promise<number>> {
  constructor(private element: HTMLElement, private canvas?: ObjCanvasDto) {}
  async execute(): Promise<number> {
    const id = await new ObjNextContentIdCommand().execute();
    const key = `${ObjectStoreKeys.CONTENT_ID}:${id}`;

    if (this.canvas) {
      await BrowserStorageWrapper.set(key, {
        id,
        html: '',
        css: {
          css: '',
          href: []
        },
        iframe: []
      });
    } else {
      fnConsoleLog('START', key);
      const htmlContent = await HtmlFactory.computeHtmlIntermediateData(this.element);
      fnConsoleLog('HTML DONE');
      const css = await CssFactory.computeCssContent();
      fnConsoleLog('CSS DONE');
      const html = HtmlFactory.computeHtmlParent(this.element.parentElement, htmlContent.html);

      AutoTagMediator.analyse(this.element);

      fnConsoleLog('END');

      await BrowserStorageWrapper.set(key, {
        id,
        html,
        css,
        iframe: htmlContent.iframe
      });
    }

    return id;
  }
}
