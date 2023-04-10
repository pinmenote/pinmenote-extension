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
import { DecryptMessageComponent } from './decrypt-message.component';
import { DecryptedValueComponent } from './decrypted-value.component';

enum ComponentState {
  DECRYPT_MESSAGE = 'DECRYPT_MESSAGE',
  DECRYPTED_VALUE = 'DECRYPTED_VALUE'
}

export const DecryptComponent = () => {
  const [state, setState] = useState<ComponentState>(ComponentState.DECRYPT_MESSAGE);
  const [message, setMessage] = useState<string>('');

  const handleDecrypt = (message: string) => {
    setState(ComponentState.DECRYPTED_VALUE);
    setMessage(message);
  };

  const handleBack = () => {
    setState(ComponentState.DECRYPT_MESSAGE);
  };
  return (
    <div>
      <div style={{ display: state == ComponentState.DECRYPT_MESSAGE ? 'inline-block' : 'none' }}>
        <DecryptMessageComponent decryptCallback={handleDecrypt} />
      </div>
      <div style={{ display: state == ComponentState.DECRYPTED_VALUE ? 'inline-block' : 'none' }}>
        <DecryptedValueComponent backCallback={handleBack} message={message} />
      </div>
    </div>
  );
};
