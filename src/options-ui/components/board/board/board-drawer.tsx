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
import Box from '@mui/material/Box';
import { Drawer } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

interface Props {
  showDrawer: boolean;
}

export const BoardDrawer: FunctionComponent<Props> = (props) => {
  return (
    <Drawer open={props.showDrawer} anchor="left" variant="persistent">
      <Toolbar />
      <Box sx={{ overflow: 'auto', width: 200, maxWidth: 200 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h6" fontWeight="bold" style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
            Tags
          </Typography>
        </div>
      </Box>
    </Drawer>
  );
};
