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
import { fnB64toBlob } from '../../../../../common/fn/fn-b64-to-blob';
import { fnConsoleLog } from '../../../../../common/fn/fn-console';

export interface FileDataDto {
  parent?: string;
  key: string;
  hash: string;
  type: SyncHashType;
}

export class ApiSegmentAddCommand extends ApiCallBase implements ICommand<Promise<boolean>> {
  constructor(private tx: BeginTxResponse, private file: string, private data: FileDataDto) {
    super();
  }
  async execute(): Promise<boolean> {
    await this.initTokenData();
    if (!this.storeUrl) return false;
    // if (await this.hasSegment(this.storeUrl)) return true;
    return await this.addSegment(this.storeUrl);
  }

  async hasSegment(storeUrl: string): Promise<boolean> {
    if (!this.storeUrl) return false;
    const authHeaders = this.getAuthHeaders();
    const params = this.data.parent ? `?parent=${this.data.parent}` : '';
    const resp = await FetchService.fetch<BeginTxResponse>(
      `${storeUrl}/api/v1/segment/has/${this.tx.tx}/${this.data.hash}${params}`,
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

  async addSegment(storeUrl: string): Promise<boolean> {
    const formData = new FormData();
    if (this.data.type.toString() === SyncHashType.Img) {
      if (this.file === 'data:') {
        fnConsoleLog('ApiSegmentAddCommand->addSegment->EMPTY', this.file);
        formData.append('file', new Blob([this.file], { type: 'image/svg+xml' }));
      } else {
        try {
          const blob = fnB64toBlob(this.file);
          formData.append('mimeType', blob.type);
          formData.append('file', blob);
        } catch (e) {
          fnConsoleLog(this.file, this.data, e);
          throw new Error('ApiSegmentAddCommand->addSegment->Error->Img->base64');
        }
      }
    } else if (this.data.type.toString() === SyncHashType.ObjPdf) {
      const blob = fnB64toBlob(this.file);
      formData.append('mimeType', blob.type);
      formData.append('file', blob);
    } else {
      const fileData = deflate(this.file);
      formData.append('file', new Blob([fileData], { type: 'application/zip' }));
      // console.log(`compression ${Math.round((fileData.length / this.file.length) * 100)}%`);
    }

    if (this.data.parent) formData.append('parent', this.data.parent);
    formData.append('key', this.data.key);
    formData.append('hash', this.data.hash);
    formData.append('type', this.data.type.toString());

    const authHeaders = this.getAuthHeaders(false);
    const resp = await FetchService.fetch(
      `${storeUrl}/api/v1/segment/add/${this.tx.tx}`,
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
