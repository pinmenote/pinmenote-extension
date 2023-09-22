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
import { ApiCallBase } from '../../api-call.base';
import { BeginTxResponse, SyncHashType } from '../api-store.model';
import { FetchService } from '@pinmenote/fetch-service';
import { ICommand } from '../../../../../common/model/shared/common.dto';
import { deflate } from 'pako';

export interface FileDataDto {
  parent?: string;
  key: string;
  hash: string;
  type: SyncHashType;
}

export class ApiSegmentAddCommand extends ApiCallBase implements ICommand<Promise<boolean>> {
  constructor(private tx: BeginTxResponse, private file: string | Blob, private data: FileDataDto) {
    super();
  }
  async execute(): Promise<boolean> {
    await this.initTokenData();
    if (!this.storeUrl) return false;
    if (await this.hasSegment()) return true;
    return await this.addSegment();
  }

  async hasSegment(): Promise<boolean> {
    const authHeaders = this.getAuthHeaders();
    const params = this.data.parent ? `?parent=${this.data.parent}` : '';
    const resp = await FetchService.fetch<BeginTxResponse>(
      `${this.storeUrl!}/api/v1/segment/has/${this.tx.tx}/${this.data.hash}${params}`,
      {
        type: 'TEXT',
        headers: {
          ...authHeaders
        }
      },
      this.refreshParams()
    );
    return resp.status === 200;
  }

  async addSegment(): Promise<boolean> {
    const formData = new FormData();
    if (this.file instanceof Blob) {
      formData.append('file', this.file);
    } else {
      const fileData = deflate(this.file);
      formData.append('file', new Blob([fileData], { type: 'application/zip' }));
      console.log(`compression ${Math.round((fileData.length / this.file.length) * 100)}%`);
    }

    if (this.data.parent) formData.append('parent', this.data.parent);
    formData.append('key', this.data.key);
    formData.append('hash', this.data.hash);
    formData.append('type', this.data.type.toString());

    const authHeaders = this.getAuthHeaders(false);
    const resp = await FetchService.fetch(
      `${this.storeUrl!}/api/v1/segment/add/${this.tx.tx}`,
      {
        headers: {
          ...authHeaders
        },
        type: 'TEXT',
        method: 'POST',
        body: formData
      },
      this.refreshParams()
    );
    // fnConsoleLog('ApiSegmentAddCommand->resp', resp);
    return resp.status === 200;
  }
}
