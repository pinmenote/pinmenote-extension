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
import { CssFactory } from '../../factory/css.factory';
import { HtmlFactory } from '../../factory/html.factory';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjSnapshotDto } from '../../../common/model/obj/obj-snapshot.dto';
import { ObjUrlDto } from '../../../common/model/obj/obj.dto';
import { ScreenshotFactory } from '../../../common/factory/screenshot.factory';
import { XpathFactory } from '../../../common/factory/xpath.factory';

export class SnapshotCreateCommand implements ICommand<Promise<ObjSnapshotDto>> {
  constructor(private url: ObjUrlDto, private element: HTMLElement) {}

  async execute(): Promise<ObjSnapshotDto> {
    const htmlContent = await HtmlFactory.computeHtmlIntermediateData(this.element);
    const css = await CssFactory.computeCssContent();

    const rect = XpathFactory.computeRect(this.element);
    const screenshot = await ScreenshotFactory.takeScreenshot(rect, this.url);

    const html = HtmlFactory.computeHtmlParent(this.element.parentElement, htmlContent.html);

    return {
      title: document.title,
      url: this.url,
      screenshot,
      html,
      css,
      iframe: htmlContent.iframe
    };
  }
}
