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
import { BusDownloadMessage, BusMessageType } from '../../../../common/model/bus.model';
import { BrowserApi } from '../../../../common/service/browser.api.wrapper';
import { PinModel } from '../../pin.model';
import { applyStylesToElement } from '../../../../common/style.utils';
import { fnUid } from '../../../../common/fn/fn-uid';

const elStyles = {
  'margin-right': '10px',
  'user-select': 'none',
  cursor: 'pointer',
  display: 'none'
};

export class DownloadCsvButton {
  constructor(private model: PinModel) {}

  private readonly el = document.createElement('div');

  render(): HTMLElement {
    this.el.innerText = 'csv';
    this.el.addEventListener('click', this.handleClick);

    applyStylesToElement(this.el, elStyles);

    return this.el;
  }

  cleanup(): void {
    this.el.removeEventListener('click', this.handleClick);
  }

  visible(): boolean {
    const parent = this.model.ref.parentElement;
    return (
      this.model.ref.tagName === 'TABLE' ||
      this.model.ref.getElementsByTagName('table').length > 0 ||
      document.getElementsByClassName(this.model.ref.className).length > 1 ||
      (!!parent && parent.getElementsByTagName(this.model.ref.tagName).length > 0)
    );
  }

  show(): void {
    this.el.style.display = 'inline-block';
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  private handleClick = async (): Promise<void> => {
    if (this.model.ref.tagName === 'TABLE') {
      return await this.downloadTable(this.model.ref as HTMLTableElement);
    }
    const tableElements = this.model.ref.getElementsByTagName('table');
    if (tableElements.length > 0) {
      const table: HTMLTableElement = tableElements[0];
      await this.downloadTable(table);
    } else if (document.getElementsByClassName(this.model.ref.className).length > 1) {
      await this.downloadSameClass(this.model.ref);
    } else {
      const parent = this.model.ref.parentElement;
      if (!!parent && parent.getElementsByTagName(this.model.ref.tagName).length > 0) {
        await this.downloadSameTag(parent, this.model.ref.tagName);
      }
    }
  };

  private downloadSameTag = async (element: HTMLElement, tagName: string): Promise<void> => {
    const refList = Array.from(element.getElementsByTagName(tagName));
    const data: string[][] = [];
    for (const ref of refList) {
      const row = this.refStringList(ref as HTMLElement);
      data.push(row);
    }
    await this.downloadCsv(data);
  };

  private downloadSameClass = async (element: HTMLElement): Promise<void> => {
    const refList = Array.from(document.getElementsByClassName(element.className));
    const data: string[][] = [];
    for (const ref of refList) {
      const row = this.refStringList(ref as HTMLElement);
      data.push(row);
    }
    await this.downloadCsv(data);
  };

  private refStringList(ref: HTMLElement): string[] {
    const out: string[] = [];
    const row = Array.from(ref.children);
    for (const col of row) {
      /*if (col.children.length > 0) {
        const colChildList = Array.from(col.children);
        for (const colChild of colChildList) {
          const txt = (colChild as HTMLElement).innerText;
          txt ? out.push(txt) : out.push('-');
        }
      } else {

      }*/
      if (col.hasAttribute('href')) {
        let href = col.getAttribute('href') || '/';
        if (href?.startsWith('/')) {
          href = location.origin + href;
        }
        out.push(href);
      }
      out.push((col as HTMLElement).innerText);
    }
    return out;
  }

  private downloadTable = async (table: HTMLTableElement): Promise<void> => {
    const tableData = this.tableToArray(table);
    await this.downloadCsv(tableData);
  };

  private tableToArray(table: HTMLTableElement): string[][] {
    // TODO handle colspan, rowspan
    const tableRows = Array.from(table.rows);
    const tableData: string[][] = [];

    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      const rowCells = Array.from(row.cells);
      const cellData = [];

      for (let j = 0; j < rowCells.length; j++) {
        const cell = rowCells[j];
        cellData.push(cell.innerText);
      }

      tableData.push(cellData);
    }
    return tableData;
  }

  private downloadCsv = async (tableData: string[][]): Promise<void> => {
    const blob = new Blob([this.makeCsv(tableData)], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const filename = `${fnUid()}.csv`;

    await BrowserApi.sendRuntimeMessage<BusDownloadMessage>({
      type: BusMessageType.CONTENT_DOWNLOAD_DATA,
      data: {
        url,
        filename
      }
    });
  };

  private makeCsv(csvData: string[][]): string {
    let out = '';
    const separator = ';';

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];

      for (let j = 0; j < row.length; j++) {
        const sep = j === row.length - 1 ? '\n' : separator;
        const value = row[j].replace(/"/g, '""');
        out += `"${value}"${sep}`;
      }
    }
    return out;
  }
}
