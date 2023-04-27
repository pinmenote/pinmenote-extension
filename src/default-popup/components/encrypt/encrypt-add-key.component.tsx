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
import { COLOR_DEFAULT_BORDER, DEFAULT_BORDER_RADIUS } from '../../../common/components/colors';
import React, { FunctionComponent, useState } from 'react';
import Button from '@mui/material/Button';
import { CryptoStore } from '../../../common/store/crypto.store';
import { StyledInput } from '../../../common/components/react/styled.input';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';

interface EncryptAddKeyComponentProps {
  hideComponent: () => void;
}

const validatePublicKey = (key: string): boolean => {
  if (!key) return false;
  return true;
};

const inputContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: 5,
  borderRadius: DEFAULT_BORDER_RADIUS,
  margin: '5px 10px 0px 0px'
};

export const EncryptAddKeyComponent: FunctionComponent<EncryptAddKeyComponentProps> = (props) => {
  const [username, setUsername] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');

  const handleAdd = async () => {
    if (!username) {
      alert('Empty Username');
      return;
    }
    if (!validatePublicKey(publicKey)) {
      alert('Invalid public key');
      return;
    }
    const added = await CryptoStore.addUserPublicKey(username, publicKey);
    if (!added) {
      alert('Username with key already exists');
      return;
    }
    setUsername('');
    setPublicKey('');
    props.hideComponent();
  };

  return (
    <div>
      <div style={{ width: '100%' }}>
        <Typography fontSize="1.5em" fontWeight="bold" style={{ marginTop: 10 }}>
          Add public key
        </Typography>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ border: COLOR_DEFAULT_BORDER, ...inputContainerStyle }}>
            <StyledInput
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: 288 }}
              value={username}
              placeholder="Username"
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Typography fontSize="1.2em" style={{ marginTop: 10, marginBottom: 10 }}>
            Armored Public Key
          </Typography>
          <TextareaAutosize
            cols={33}
            minRows={12}
            maxRows={12}
            onChange={(e) => setPublicKey(e.target.value)}
            value={publicKey}
            placeholder="Public key"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' }}>
          <Button sx={{ width: '40%' }} variant="outlined" onClick={() => props.hideComponent()}>
            Cancel
          </Button>
          <Button sx={{ width: '40%' }} variant="outlined" onClick={handleAdd}>
            Add Key
          </Button>
        </div>
      </div>
    </div>
  );
};
