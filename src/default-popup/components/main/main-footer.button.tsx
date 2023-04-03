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
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import Button from '@mui/material/Button';

export const MainFooterButton: FunctionComponent = () => {
  return (
    <div style={{ position: 'absolute', bottom: 0, width: 300, paddingTop: 5, backgroundColor: '#ffffff' }}>
      <Button
        sx={{ width: '100%' }}
        style={{ marginBottom: 10 }}
        variant="outlined"
        onClick={() => BrowserApi.openOptionsPage()}
      >
        Go to pin board
      </Button>
    </div>
  );
};