import { contextBridge, ipcRenderer } from 'electron'
import { IpcRendererEvent } from 'electron/renderer';
import { v4 as uuid } from 'uuid';

type Callback = (...args: any[]) => void;

export interface IPCMessage {
  name: string
  data: any
}

class ListenerSet {
  channel: string;
  callback: Callback;

  constructor(channel: string, callback: Callback) {
    this.channel = channel;
    this.callback = callback;
  }
}

let listeners: Map<string, ListenerSet> = new Map();


export const api = {

  ipcRenderer:  ipcRenderer,

  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sayHello`
   */

  sendMessage: (message: IPCMessage) => { 
    ipcRenderer.send('message', message)
  },

  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Callback): string => {
    let listener_id = uuid();
    listeners.set(listener_id, new ListenerSet(channel, callback));
    ipcRenderer.on(channel, callback);
    console.log("Binding finished", channel, ipcRenderer.listenerCount('channel'));
    return listener_id;
  },

  once: (channel: string, callback: Callback): string => {
    let listener_id = uuid();
    listeners.set(listener_id, new ListenerSet(channel, callback));
    ipcRenderer.once(channel, callback);
    return listener_id;
  },

  off: (listener_id: string) => {
    let listener_set = listeners.get(listener_id);
    if (listener_set !== undefined) {
      ipcRenderer.removeListener(listener_set.channel, listener_set.callback);
      listeners.delete(listener_id);
    }
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }

}

contextBridge.exposeInMainWorld('Main', api)
