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
import { BrowserApi } from '@pinmenote/browser-api';
import BugReportIcon from '@mui/icons-material/BugReport';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

interface Props {
  openBugReport?: () => void;
}

export const MainFooterButton: FunctionComponent<Props> = (props) => {
  return (
    <div style={{ position: 'absolute', bottom: 32, width: 300, paddingTop: 5, backgroundColor: '#ffffff' }}>
      <div
        style={{
          display: props.openBugReport ? 'flex' : 'none',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <IconButton
          style={{ marginBottom: 10, marginRight: 5, border: '1px solid #333333' }}
          title="Report bug"
          onClick={() => (props.openBugReport ? props.openBugReport() : '')}
        >
          <BugReportIcon />
        </IconButton>
        <Button
          sx={{ width: '100%' }}
          style={{ marginBottom: 10 }}
          variant="outlined"
          onClick={() => BrowserApi.openOptionsPage()}
        >
          go to pin board
        </Button>
      </div>
    </div>
  );
};
