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
import { BookmarkAddCommand } from '../../../common/command/bookmark/bookmark-add.command';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { CssFactory } from '../../factory/css.factory';
import { HtmlFactory } from '../../factory/html.factory';
import { ObjBookmarkDto } from '../../../common/model/obj-bookmark.model';
import { ObjUrlDto } from '../../../common/model/obj.model';
import { ScreenshotFactory } from '../../../common/factory/screenshot.factory';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class ContentBookmarkAddCommand implements ICommand<Promise<void>> {
  constructor(private url: ObjUrlDto, private href?: string) {}

  async execute(): Promise<void> {
    if (this.href !== this.url.href) {
      fnConsoleLog('SKIP', this.href);
      return;
    }
    const htmlContent = await HtmlFactory.computeHtmlIntermediateData(document.body);
    const css = await CssFactory.computeCssContent();
    const screenshot = await ScreenshotFactory.takeScreenshot(undefined, this.url);
    const dto: ObjBookmarkDto = {
      title: document.title,
      url: this.url,
      screenshot,
      html: htmlContent.html,
      css
    };
    await new BookmarkAddCommand(dto).execute();
    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_BOOKMARK_ADD });
  }
}
