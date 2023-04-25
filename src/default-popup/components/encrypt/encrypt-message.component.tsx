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
import { Autocomplete, TextField } from '@mui/material';
import React, { FunctionComponent, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { CryptoStore } from '../../../common/store/crypto.store';
import { EncryptMessage } from '../component-model';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';

interface EncryptMessageComponentProps {
  encryptCallback: (message: EncryptMessage) => void;
  message: EncryptMessage;
}

export const EncryptMessageComponent: FunctionComponent<EncryptMessageComponentProps> = (props) => {
  const [username, setUsername] = useState<string>(props.message.username);
  const [usernameList, setUsernameList] = useState<string[]>([]);
  const [message, setMessage] = useState<string>(props.message.message);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const list = await CryptoStore.getUsernameKeyList();
      setUsernameList(list);
    })();
  }, []);

  const handleUsernameChange = (e: React.SyntheticEvent, value: string | null) => {
    if (value) setUsername(value);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleEncrypt = () => {
    props.message.username = username;
    props.message.message = message;
    props.encryptCallback(props.message);
  };

  return (
    <div>
      <Typography fontSize="2em">Encrypt</Typography>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
        <Autocomplete
          size="small"
          value={username}
          onChange={handleUsernameChange}
          renderInput={(params) => <TextField style={{ width: '300px' }} {...params} label="user" />}
          options={usernameList}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <TextareaAutosize
          value={message}
          onChange={handleMessageChange}
          style={{ outline: 'none' }}
          maxRows={16}
          minRows={16}
          cols={34}
          placeholder="Message"
        ></TextareaAutosize>
      </div>
      <div style={{ display: 'flex', marginTop: 5 }}>
        <Button style={{ width: '100%' }} variant="outlined" onClick={handleEncrypt}>
          Encrypt
        </Button>
      </div>
    </div>
  );
};
