import Database from 'better-sqlite3';
import { ipcMain, WebContents } from 'electron';
import { IpcMainEvent } from 'electron/main';

import { IPCMessage } from './bridge';


let webContents: WebContents | null;

export function setSender(sender: WebContents)  {
  webContents = sender;
}

// Configure database first
let db = new Database('data.db');

db.prepare("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, token TEXT UNIQUE)")
  .run();

function create_new_user(name: string, token: string) {
  if (name.length > 0 && token.length > 0) {
    console.log("Success");
    db.prepare("INSERT INTO users (name, token) VALUES (?, ?)")
      .run(name, token);
      return true;
  }  else {
    console.log("Failed");
    return false;
  }
}

export default function handle_message(event: IpcMainEvent, message: IPCMessage) {
  switch (message.name) {
  case 'log':
    console.log(message.data);
    break;
  case 'new_user':
    event.reply(
      'new_user_response',
      create_new_user(message.data.name, message.data.token)
    );
    break;
  case 'remove_user_request':
    db.prepare("DELETE FROM users WHERE id = ?").run(message.data);
  case 'user_names_request':
    let names = db.prepare("SELECT id, name FROM users").all();
    event.reply(
      'user_names_response',
      names
    )
    console.log("returned:", names);
    break;
  default:
    console.warn(`Unknown message type: ${message.name}. Data: ${JSON.stringify(message.data)}`);
  }
}
