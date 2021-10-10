import { ipcMain, WebContents } from 'electron';
import { IpcMainEvent } from 'electron/main';

import { IPCMessage } from './bridge';
import DatabaseHandler from './database_handler';

let db = new DatabaseHandler();
let currentUser = null;

let webContents: WebContents | null;

export function setSender(sender: WebContents)  {
  webContents = sender;
}

function create_new_user(name: string, token: string) {
  if (name.length > 0 && token.length > 0) {
    db.add_user(name, token);
    return true;
  }  else {
    return false;
  }
}

function handle_getting_user_information(message: IPCMessage) {
  currentUser = db.get_user_handler(message.data.userId);
}

export default function handle_message(event: IpcMainEvent, message: IPCMessage) {
  switch (message.name) {
  case 'log':
    console.log(message.data);
    break;
  case 'user_information_request':
    event.reply(
      'user_information_response',
      handle_getting_user_information(message)
      );
    break;
  case 'new_user':
    event.reply(
      'new_user_response',
      create_new_user(message.data.name, message.data.token)
    );
    break;
  case 'remove_user_request':
    db.remove_user(message.data);
  case 'user_names_request':
    event.reply(
      'user_names_response',
      db.get_users()
    )
    break;
  default:
    console.warn(`Unknown message type: ${message.name}. Data: ${JSON.stringify(message.data)}`);
  }
}
