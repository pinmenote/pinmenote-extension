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
import React, { FunctionComponent } from 'react';
import Button from '@mui/material/Button';
import TextareaAutosize from '@mui/material/TextareaAutosize';

interface Props {
  backCallback: () => void;
  message: string;
}

export const DecryptedValueComponent: FunctionComponent<Props> = (props) => {
  return (
    <div>
      <h1>Decrypted value</h1>
      <div>
        <TextareaAutosize
          value={props.message}
          minRows={15}
          maxRows={17}
          cols={34}
          placeholder="Message"
        ></TextareaAutosize>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => props.backCallback()}>
          Back
        </Button>
      </div>
    </div>
  );
};
