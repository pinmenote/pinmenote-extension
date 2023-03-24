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
import { HtmlFactory } from '../../factory/html.factory';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjSnapshotDto } from '../../../common/model/obj/obj-snapshot.dto';
import { ObjUrlDto } from '../../../common/model/obj/obj.dto';
import { PageElementSnapshotAddCommand } from '../../../common/command/snapshot/page-element-snapshot-add.command';
import { ScreenshotFactory } from '../../../common/factory/screenshot.factory';
import { XpathFactory } from '../../../common/factory/xpath.factory';

export class ContentPageElementSnapshotAddCommand implements ICommand<Promise<void>> {
  constructor(private url: ObjUrlDto, private element: HTMLElement) {}

  async execute(): Promise<void> {
    const htmlContent = await HtmlFactory.computeHtmlIntermediateData(this.element);
    const css = await CssFactory.computeCssContent();

    const rect = XpathFactory.computeRect(this.element);
    const screenshot = await ScreenshotFactory.takeScreenshot(rect, this.url);

    const html = HtmlFactory.computeHtmlParent(this.element.parentElement, htmlContent.html);

    const dto: ObjSnapshotDto = {
      title: document.title,
      url: this.url,
      screenshot,
      html,
      css,
      iframe: htmlContent.iframe
    };
    await new PageElementSnapshotAddCommand(dto).execute();
    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.POPUP_PAGE_ELEMENT_SNAPSHOT_ADD });
  }
}
