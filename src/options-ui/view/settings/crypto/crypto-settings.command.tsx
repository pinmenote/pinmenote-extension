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
import { IconButton, Input } from '@mui/material';
import React, { FunctionComponent } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Typography from '@mui/material/Typography';

export const CryptoSettingsCommand: FunctionComponent = () => {
  return (
    <div>
      <Typography fontSize="2.5em" style={{ marginBottom: 10 }}>
        cryptography
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          private key
        </Typography>
        <Input style={{ width: 300 }} />
        <IconButton>
          <ContentCopyIcon />
        </IconButton>
        <IconButton title="rotate private key">
          <RestartAltIcon />
        </IconButton>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          public key
        </Typography>
        <Input style={{ width: 300 }} />
        <IconButton>
          <ContentCopyIcon />
        </IconButton>
      </div>
    </div>
  );
};
