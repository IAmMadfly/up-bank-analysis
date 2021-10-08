// import { Main } from 'electron'
import { IpcRendererEvent } from 'electron/renderer'
import { useState, useEffect, Dispatch, SetStateAction } from 'react'

interface Arguments {
  setUserId: Dispatch<SetStateAction<null>> | Dispatch<SetStateAction<number>>
}

export default function ({setUserId}: Arguments) {
    
    const [userData, setUserData]: [
        Array<any>,
        Dispatch<SetStateAction<Array<any>>>
    ] = useState(new Array());

    useEffect(() => {
        let callback_ids: Array<string> = new Array();

        callback_ids.push(
          window.Main.on(
            'user_names_response',
            (_: IpcRendererEvent, names: Array<string>) => {
              setUserData(names);
            }
          )
        );
    
        window.Main.sendMessage({name: 'user_names_request', data: null});

        return () => {
          for (let id of callback_ids) {
            window.Main.off(id);
          }
        }
      }, []);

      function getUserElements() {
        let elements: JSX.Element[] = new Array();
    
        for (let user of userData) {
          elements.push(
            <div style={{
                display: "flex",
                justifyContent: "space-around",
                width: "40%"
                }}>
              <button onClick={
              ()=>{
                setUserId(user.id);
              }
              }
              >👍</button>
              <span>{user.name}</span>
              <button onClick={
                  ()=>{
                    window.Main.sendMessage(
                      {name: 'remove_user_request', data: user.id }
                      )
                    }
                  }
                  >⛔</button>
            </div>
          );
        }
    
        return elements;
      }

      return (
        <div style={{display: "flex", width: "100%", justifyContent: "center"}}>
            <div style={{
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap"
            }}>
            {getUserElements()}
            </div>
        </div>
      )
}
