/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
import { PinByIdRequest, PinObject } from '../../../common/model/pin.model';
import { fnIsoDateToUtcMiliseconds, fnMilisecondsToUtcDate } from '../../../common/fn/date.fn';
import { ApiStore } from '../../store/api.store';
import { ApiSyncQuotaCommand } from './api-sync-quota.command';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { CryptoDecryptCommand } from '../crypto/crypto-decrypt.command';
import { CryptoEncryptSignCommand } from '../crypto/crypto-encrypt-sign.command';
import { FetchService } from '../../service/fetch.service';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { ObjectTypeDto } from '../../../common/model/html.model';
import { PinAddCommand } from '../pin/pin-add.command';
import { PinRemoveCommand } from '../pin/pin-remove.command';
import { PinUpdateCommand } from '../pin/pin-update.command';
import { environmentConfig } from '../../../common/environment';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { sendRuntimeMessage } from '../../../common/message/runtime.message';
import BoolDto = Pinmenote.Common.BoolDto;
import DiskQuotaDto = Pinmenote.Sync.DiskQuotaDto;
import EncryptedObjectDto = Pinmenote.Sync.EncryptedObjectDto;
import ICommand = Pinmenote.Common.ICommand;
import ObjectIdsDto = Pinmenote.Sync.ObjectIdsDto;

export class ApiSyncPinCommand implements ICommand<Promise<BoolDto>> {
  async execute(): Promise<BoolDto> {
    // Get update dt
    let dt = '1970-01-20T00:00:00.000Z';
    fnConsoleLog('syncNotes->dt', dt);

    const username = await ApiStore.getUsername();
    const url = `${environmentConfig.apiUrl}/api/v1/sync/${username}/${ObjectTypeDto.Pin}/list?dt=${dt}`;
    const authHeaders = await ApiStore.getAuthHeaders();
    const syncResult = await FetchService.get<ObjectIdsDto>(url, authHeaders);
    fnConsoleLog('syncNotes->server', syncResult);
    dt = await this.reconcile(dt, syncResult.ids);

    const ms = fnIsoDateToUtcMiliseconds(dt);
    fnConsoleLog('syncNotes->reconcile->dt', dt, ms);
    dt = await this.sendAll(dt);
    fnConsoleLog('syncNotes->sendAll->dt', dt);

    // Update last date
    await BrowserStorageWrapper.set(ApiStore.KEY_NOTE_UPDATE, dt);

    const quota = await new ApiSyncQuotaCommand().execute();
    await sendRuntimeMessage<DiskQuotaDto>({
      type: BusMessageType.POPUP_SYNC_QUOTA,
      data: quota
    });

    return { value: true };
  }

  private async sendAll(dt: string): Promise<string> {
    let maxMs = fnIsoDateToUtcMiliseconds(dt);
    fnConsoleLog('Sync - sendAll - maxMs', maxMs);
    const ids = await this.getIds();
    for (const id of ids) {
      const pin = await this.pinGetId({ id });
      if (pin) {
        const ms = fnIsoDateToUtcMiliseconds(pin.updatedAt);
        if (ms <= maxMs) {
          fnConsoleLog('Sync - sendAll - skip', id, ms, maxMs, dt);
          continue;
        }
        maxMs = ms;
        await this.sendPin(pin);
        fnConsoleLog('Sync - sendNote - ok', id, maxMs);
      } else {
        fnConsoleLog('Sync - sendAll - not found', id);
      }
    }
    return fnMilisecondsToUtcDate(maxMs).toISOString();
  }

  private async reconcile(dt: string, serverIds: number[]): Promise<string> {
    let maxMs = fnIsoDateToUtcMiliseconds(dt);
    // sync notes that are after last id
    for (const id of serverIds) {
      const note: PinObject | undefined = await this.pinGetId({ id });
      if (!note) {
        const t = await this.addFromServer(id);
        maxMs = Math.max(t, maxMs);
      } else {
        const t = await this.updateFromServer(note);
        maxMs = Math.max(t, maxMs);
      }
    }
    return fnMilisecondsToUtcDate(maxMs).toISOString();
  }

  private async updateFromServer(pin: PinObject): Promise<number> {
    const username = await ApiStore.getUsername();
    const url = `${environmentConfig.apiUrl}/api/v1/sync/${username}/o/${pin.id}`;
    const authHeaders = await ApiStore.getAuthHeaders();
    const syncPin = await FetchService.get<EncryptedObjectDto>(url, authHeaders);
    if (syncPin.data) {
      // Check if pin local time is less than remote time and update
      const serverMs = fnIsoDateToUtcMiliseconds(syncPin.updatedAt);
      const clientMs = fnIsoDateToUtcMiliseconds(pin.updatedAt);
      if (clientMs < serverMs) {
        const data = await new CryptoDecryptCommand<PinObject>(syncPin.data, false).execute();
        if (data) {
          fnConsoleLog('Sync - updateFromServer - ok', pin.id);
          await new PinUpdateCommand({ pin: data }).execute();
          return fnIsoDateToUtcMiliseconds(syncPin.updatedAt);
        } else {
          fnConsoleLog('Sync - updateFromServer - no - decrypted', pin.id);
        }
      } else {
        fnConsoleLog('Sync - updateFromServer - no - local is newer', pin.id);
      }
    } else {
      await new PinRemoveCommand(pin).execute();
      fnConsoleLog('Sync - updateFromServer - ok - remove', pin.id);
      return fnIsoDateToUtcMiliseconds(syncPin.updatedAt);
    }
    return 0;
  }

  private async addFromServer(id: number): Promise<number> {
    const username = await ApiStore.getUsername();
    const url = `${environmentConfig.apiUrl}/api/v1/sync/${username}/o/${id}`;
    // Try to find note
    const authHeaders = await ApiStore.getAuthHeaders();
    const syncPin = await FetchService.get<EncryptedObjectDto>(url, authHeaders);
    if (syncPin.data) {
      const data = await new CryptoDecryptCommand<PinObject>(syncPin.data, false).execute();
      if (data) {
        await new PinAddCommand(data).execute();
      } else {
        fnConsoleLog('Sync - addFromServer - no - decrypted', id);
      }
      fnConsoleLog('Sync - addFromServer - ok', id);
      return fnIsoDateToUtcMiliseconds(syncPin.updatedAt);
    } else {
      fnConsoleLog('Sync - addFromServer - no - data empty so added and removed', id);
    }
    return 0;
  }

  private async sendPin(pin: PinObject): Promise<void> {
    const username = await ApiStore.getUsername();
    const url = `${environmentConfig.apiUrl}/api/v1/sync/${username}/${ObjectTypeDto.Pin}`;
    const data = await new CryptoEncryptSignCommand(pin).execute();
    const dto: EncryptedObjectDto = {
      id: pin.id,
      type: ObjectTypeDto.Pin as unknown as Pinmenote.Sync.ObjectTypeDto,
      createdAt: pin.createdAt,
      updatedAt: pin.updatedAt,
      data
    };
    fnConsoleLog('sendNote->dto', dto);
    const authHeaders = await ApiStore.getAuthHeaders();
    await FetchService.post<BoolDto>(url, dto, authHeaders);
  }

  private async pinGetId(pin: PinByIdRequest): Promise<PinObject | undefined> {
    const key = `${ObjectStoreKeys.OBJECT_ID}:${pin.id}`;
    return await BrowserStorageWrapper.get<PinObject>(key);
  }

  private async getIds(): Promise<number[]> {
    const value = await BrowserStorageWrapper.get<number[] | undefined>(ObjectStoreKeys.PIN_ID_LIST);
    return value || [];
  }
}
