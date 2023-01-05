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
import { Button, IconButton, TextareaAutosize, Typography } from '@mui/material';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { BusMessageType } from '../../../common/model/bus.model';
import { COLOR_DEFAULT_GREY } from '../../../common/components/colors';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { StyledInput } from '../../../common/components/react/styled.input';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import { fnByteToMb } from '../../../common/fn/diskspace.fn';
import { fnOpenOptionsPage } from '../../../common/service/browser.api.wrapper';
import { sendRuntimeMessage } from '../../../common/message/runtime.message';
import DiskQuotaDto = Pinmenote.Sync.DiskQuotaDto;

class QuotaStore {
  private static sent = false;

  static quota?: DiskQuotaDto;

  static async getQuota(): Promise<void> {
    await sendRuntimeMessage<undefined>({
      type: BusMessageType.POPUP_SYNC_QUOTA
    });
  }

  static initialize(): void {
    if (this.sent) return;
    this.getQuota()
      .then(() => {
        /* ignore */
      })
      .catch(() => {
        /* ignore */
      });
    this.sent = true;
  }
}

export const AccountComponent: FunctionComponent = () => {
  const [quota, setQuota] = useState<DiskQuotaDto | undefined>(QuotaStore.quota);
  const [privateKey, setPrivateKey] = useState<string>('');
  const [privateKeyLabel, setPrivateKeyLabel] = useState<string>('Show Private Key');
  const [importKey, setImportKey] = useState<string>('');

  useEffect(() => {
    const syncKey = TinyEventDispatcher.addListener<DiskQuotaDto>(
      BusMessageType.POPUP_SYNC_QUOTA,
      (event, key, value) => {
        QuotaStore.quota = value;
        setQuota(QuotaStore.quota);
      }
    );
    const pKey = TinyEventDispatcher.addListener<string>(BusMessageType.POPUP_PRIVATE_KEY_GET, (event, key, value) => {
      setPrivateKeyLabel('Hide Private Key');
      setPrivateKey(value);
    });
    QuotaStore.initialize();
    return () => {
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_SYNC_QUOTA, syncKey);
      TinyEventDispatcher.removeListener(BusMessageType.POPUP_PRIVATE_KEY_GET, pKey);
    };
  });

  const handleLogout = async (): Promise<void> => {
    await sendRuntimeMessage<undefined>({
      type: BusMessageType.POPUP_LOGOUT
    });
  };

  const handleSyncNotes = async (): Promise<void> => {
    await sendRuntimeMessage<undefined>({
      type: BusMessageType.POPUP_SYNC_PINS
    });
  };

  const handleShowHidePrivateKey = async (): Promise<void> => {
    if (privateKey.length === 0) {
      await sendRuntimeMessage<undefined>({
        type: BusMessageType.POPUP_PRIVATE_KEY_GET
      });
    } else {
      setPrivateKey('');
      setPrivateKeyLabel('Show Private Key');
    }
  };

  const handleCopyPrivateKey = async (): Promise<void> => {
    await navigator.clipboard.writeText(privateKey);
  };

  const handleImportPrivateKey = async (): Promise<void> => {
    await sendRuntimeMessage<string>({
      type: BusMessageType.POPUP_PRIVATE_KEY_IMPORT,
      data: importKey
    });
  };

  return (
    <div>
      <Typography align="center" fontSize="2em" fontWeight="bold">
        Authenticated
      </Typography>
      <div style={{ marginBottom: '10px' }}>
        <Typography align="center" style={{ margin: '10px' }}>
          <Typography display="inline" fontWeight="bold">
            Space Used{' '}
          </Typography>
          <Typography display="inline">
            {fnByteToMb(quota?.used)} / {fnByteToMb(quota?.quota)} MB
          </Typography>
        </Typography>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleSyncNotes}>
          Sync Notes
        </Button>
        <Typography fontSize="0.9em" style={{ margin: '10px' }}>
          Last Sync 2022-10-19 21:14:00
        </Typography>
      </div>
      <div>
        <Typography fontSize="1.2em" fontWeight="bold">
          Private Key
        </Typography>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ maxHeight: '200px', width: '290px', overflow: 'auto' }}>
            <StyledInput style={{ width: '100%' }} value={privateKey} />
          </div>
          <IconButton
            onClick={handleCopyPrivateKey}
            style={{ display: privateKey.length > 0 ? 'inline-block' : 'none' }}
          >
            <ContentCopyIcon />
          </IconButton>
        </div>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleShowHidePrivateKey}>
          {privateKeyLabel}
        </Button>
        <div style={{ marginBottom: '10px', marginTop: '10px' }}>
          <Typography fontSize="1.2em" fontWeight="bold">
            Import key
          </Typography>
          <div style={{ border: `1px solid ${COLOR_DEFAULT_GREY}`, borderRadius: '5px', marginBottom: '10px' }}>
            <TextareaAutosize maxRows={5} cols={34} onChange={(e) => setImportKey(e.target.value)} value={importKey} />
          </div>
          <Button sx={{ width: '100%' }} variant="outlined" onClick={handleImportPrivateKey}>
            Import Private Key
          </Button>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, width: 300 }}>
        <Button sx={{ width: '100%' }} style={{ marginBottom: 10 }} variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
        <Button
          sx={{ width: '100%' }}
          style={{ marginBottom: 10 }}
          variant="outlined"
          onClick={() => fnOpenOptionsPage('#settings')}
        >
          Advanced options
        </Button>
      </div>
    </div>
  );
};
