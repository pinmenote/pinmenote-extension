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

interface EncryptedContentComponentProps {
  backToMessageCallback: () => void;
  message: string;
}

export const EncryptedContentComponent: FunctionComponent<EncryptedContentComponentProps> = (props) => {
  const handleBack = () => {
    props.backToMessageCallback();
  };

  const handleCopy = () => {
    const copyFn = (event: ClipboardEvent) => {
      event.preventDefault();
      event.clipboardData?.setData('text/plain', props.message);
    };
    document.addEventListener('copy', copyFn);
    document.execCommand('copy');
    document.removeEventListener('copy', copyFn);
  };

  return (
    <div style={{ marginTop: 5 }}>
      <h2>Encrypted value</h2>
      <div>
        <TextareaAutosize
          value={props.message}
          minRows={15}
          maxRows={17}
          cols={34}
          placeholder="Message"
        ></TextareaAutosize>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <Button variant="outlined" onClick={handleBack}>
          Back to typing
        </Button>
        <Button variant="outlined" onClick={handleCopy}>
          Copy
        </Button>
      </div>
    </div>
  );
};
