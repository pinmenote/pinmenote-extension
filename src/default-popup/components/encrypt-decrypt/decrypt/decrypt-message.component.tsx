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
import Checkbox from '@mui/material/Checkbox';
import { CryptoDecryptCommand } from '../../../../common/command/crypto/crypto-decrypt.command';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';

interface DecryptMessageComponentProps {
  decryptCallback: (message: string) => void;
}

export const DecryptMessageComponent: FunctionComponent<DecryptMessageComponentProps> = (props) => {
  const [checked, setChecked] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleDecrypt = async () => {
    let decryptedMessage = 'Failed to decrypt';
    try {
      const msg = await new CryptoDecryptCommand(message, checked).execute();
      if (msg) decryptedMessage = msg;
    } catch (e) {
      /* IGNORE */
    }
    props.decryptCallback(decryptedMessage);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleCheckSignatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  return (
    <div>
      <h1>Decrypt message</h1>
      <div>
        <TextareaAutosize
          value={message}
          onChange={handleMessageChange}
          minRows={15}
          maxRows={17}
          cols={34}
          placeholder="Message"
        ></TextareaAutosize>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Typography>Check signature</Typography>
          <Checkbox checked={checked} onChange={handleCheckSignatureChange} />
        </div>
        <Button variant="outlined" onClick={handleDecrypt}>
          Decrypt
        </Button>
      </div>
    </div>
  );
};
