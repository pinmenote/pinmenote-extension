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
import { CryptoEncryptCommand } from '../../../common/command/crypto/crypto-encrypt.command';
import { CryptoStore } from '../../../common/store/crypto.store';
import { EncryptAddKeyComponent } from './encrypt-add-key.component';
import { EncryptMessage } from '../component-model';
import { EncryptMessageComponent } from './encrypt-message.component';
import { EncryptedValueComponent } from './encrypted-value.component';

enum ComponentState {
  ENCRYPT_MESSAGE = 'ENCRYPT_MESSAGE',
  ENCRYPTED_VALUE = 'ENCRYPTED_VALUE',
  ADD_KEY = 'ADD_KEY'
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

  const setEncryptMessageState = () => {
    setState(ComponentState.ENCRYPT_MESSAGE);
  };

  const handleNewKey = () => {
    setState(ComponentState.ADD_KEY);
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

  const getComponent = (state: ComponentState) => {
    switch (state) {
      case ComponentState.ENCRYPT_MESSAGE:
        return <EncryptMessageComponent message={message} encryptCallback={handleEncrypt} addCallback={handleNewKey} />;
      case ComponentState.ENCRYPTED_VALUE:
        return <EncryptedValueComponent backToMessageCallback={setEncryptMessageState} message={encryptedMessage} />;
      case ComponentState.ADD_KEY:
        return <EncryptAddKeyComponent hideComponent={setEncryptMessageState} />;
    }
  };

  const component = getComponent(state);

  return <div>{component}</div>;
};
