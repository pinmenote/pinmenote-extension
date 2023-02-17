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
import React, { FunctionComponent, useState } from 'react';
import Button from '@mui/material/Button';
import { CryptoStore } from '../../../../../common/store/crypto.store';
import Input from '@mui/material/Input';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';

interface CryptoAddUserKeyProps {
  reloadList: () => void;
  hideComponent: () => void;
}

export const AddKeyComponent: FunctionComponent<CryptoAddUserKeyProps> = (props) => {
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
    props.reloadList();
    props.hideComponent();
  };

  const handleCancel = () => {
    props.hideComponent();
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Typography fontSize="1.2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          Username
        </Typography>
        <Input
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: 300 }}
          value={username}
          placeholder="Username"
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10, width: '100%' }}>
        <Typography fontSize="1.2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          Armored Public Key
        </Typography>
        <TextareaAutosize
          cols={65}
          minRows={10}
          maxRows={10}
          onChange={(e) => setPublicKey(e.target.value)}
          value={publicKey}
          placeholder="Public key"
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' }}>
        <Button sx={{ width: '40%' }} variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button sx={{ width: '40%' }} variant="outlined" onClick={handleAdd}>
          Add User Key
        </Button>
      </div>
    </div>
  );
};

const validatePublicKey = (key: string): boolean => {
  if (!key) return false;
  return true;
};
