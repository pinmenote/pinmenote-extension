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
import React, { FunctionComponent, useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { AddKeyComponent } from './add-key.component';
import { CryptoStore } from '../../../../../common/store/crypto.store';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { KeyDetailsComponent } from './key-details.component';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const KeyListComponent: FunctionComponent = () => {
  const [usernameList, setUsernameList] = useState<string[]>([]);
  const [username, setUsername] = useState<string>('');

  const [addVisible, setAddVisible] = useState<boolean>(false);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);

  const reloadList = async () => {
    const list = await CryptoStore.getUsernameKeyList();
    setUsernameList(list);
  };

  useEffect(() => {
    setTimeout(async () => {
      await reloadList();
    }, 0);
  }, []);

  const handleAdd = () => {
    setAddVisible(!addVisible);
    setDetailsVisible(false);
  };

  const handleRemoveKey = async (username: string) => {
    await CryptoStore.delUserPublicKey(username);
    setUsername('');
    setDetailsVisible(false);
    await reloadList();
  };

  const handleShowKey = (username: string) => {
    setUsername(username);
    setDetailsVisible(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'end', flexDirection: 'row' }}>
        <Typography fontSize="2em" textAlign="left" style={{ marginTop: 20 }}>
          User List
        </Typography>
        <IconButton onClick={handleAdd}>
          <AddIcon />
        </IconButton>
      </div>
      <div style={{ display: detailsVisible ? 'inline-block' : 'none' }}>
        <KeyDetailsComponent username={username} hideDetails={() => setDetailsVisible(false)} />
      </div>
      <div style={{ display: addVisible ? 'inline-block' : 'none' }}>
        <AddKeyComponent hideComponent={() => setAddVisible(false)} reloadList={reloadList} />
      </div>
      <div>
        <List>
          {usernameList.map((username) => (
            <ListItem
              key={username}
              secondaryAction={
                <div>
                  <IconButton onClick={() => handleShowKey(username)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleRemoveKey(username)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              }
            >
              <ListItemText primary={username}></ListItemText>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};
