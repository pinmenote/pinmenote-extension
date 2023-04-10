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
import React, { useState } from 'react';
import { CryptoEncryptCommand } from '../../../../common/command/crypto/crypto-encrypt.command';
import { CryptoStore } from '../../../../common/store/crypto.store';
import { EncryptMessage } from '../encrypt-decrypt.component.model';
import { EncryptMessageComponent } from './encrypt-message.component';
import { EncryptedValueComponent } from './encrypted-value.component';

enum ComponentState {
  ENCRYPT_MESSAGE = 'ENCRYPT_MESSAGE',
  ENCRYPTED_VALUE = 'ENCRYPTED_VALUE'
}

export const EncryptComponent = () => {
  const [message, setMessage] = useState<EncryptMessage>({ username: '', message: '' });
  const [encryptedMessage, setEncryptedMessage] = useState<string>('');
  const [state, setState] = useState<ComponentState>(ComponentState.ENCRYPT_MESSAGE);

  const handleEncrypt = async (message: EncryptMessage) => {
    setMessage(message);
    await encryptMessage(message);
    setState(ComponentState.ENCRYPTED_VALUE);
  };

  const handleBackToMessage = () => {
    setState(ComponentState.ENCRYPT_MESSAGE);
  };

  const encryptMessage = async (data: EncryptMessage) => {
    const { username, message } = data;
    const key = await CryptoStore.getUserPublicKey(username);
    if (!key) {
      const msg = `Unable to load key for ${username}`;
      if (msg !== encryptedMessage) setEncryptedMessage(msg);
    } else {
      const msg = await new CryptoEncryptCommand(message, key).execute();
      if (msg !== encryptedMessage) setEncryptedMessage(msg);
    }
  };

  return (
    <div>
      <div style={{ display: state == ComponentState.ENCRYPT_MESSAGE ? 'inline-block' : 'none' }}>
        <EncryptMessageComponent message={message} encryptCallback={handleEncrypt} />
      </div>
      <div style={{ display: state == ComponentState.ENCRYPTED_VALUE ? 'inline-block' : 'none' }}>
        <EncryptedValueComponent backToMessageCallback={handleBackToMessage} message={encryptedMessage} />
      </div>
    </div>
  );
};
