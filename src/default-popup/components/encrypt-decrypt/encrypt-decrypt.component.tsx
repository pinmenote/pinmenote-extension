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
import { DecryptComponent } from './decrypt.component';
import { EncryptComponent } from './encrypt.component';
import { TopMenuComponent } from '../common/top-menu.component';

export const EncryptDecryptComponent: FunctionComponent = () => {
  const [selected, setSelected] = useState<string>('encrypt');
  const handleEncryptClick = () => {
    setSelected('encrypt');
  };

  const handleDecryptClick = () => {
    setSelected('decrypt');
  };
  return (
    <div>
      <TopMenuComponent
        firstLabel="Encrypt"
        secondLabel="Decrypt"
        firstClickCallback={handleEncryptClick}
        secondClickCallback={handleDecryptClick}
      />
      <div style={{ display: selected === 'encrypt' ? 'inline-block' : 'none' }}>
        <EncryptComponent />
      </div>
      <div style={{ display: selected === 'decrypt' ? 'inline-block' : 'none' }}>
        <DecryptComponent />
      </div>
    </div>
  );
};
