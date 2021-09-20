import { Main } from 'electron'
import { IpcRendererEvent } from 'electron/renderer'
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react'
// import { ipcRenderer } from 'electron'

export default function () {
  const [userName, setUserName] = useState('')
  const [userToken, setUserToken] = useState('')
  const [textColour, setTextColour] = useState('#fff')
  const [userData, setUserData]: [Array<any>, Dispatch<SetStateAction<Array<any>>>] = useState(new Array());

  useEffect(() => {
    let callback_ids: Array<string> = new Array();
    callback_ids.push(
      window.Main.on(
        'new_user_response', 
        (_: IpcRendererEvent, successful: boolean) => {
          setTextColour(successful ? '#0f0' : '#f00')
        }
      )
    );
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


  let textStyle = {
    color: textColour,
  }

  function createNewUser() {
    window.Main.sendMessage({
      name: 'new_user',
      data: {
        name: userName,
        token: userToken,
      },
    })
  }


  function getUserElements() {
    let elements: JSX.Element[] = new Array();

    for (let user of userData) {
      elements.push(
        <div>
          <span>{user.name}</span>
          <button onClick={()=>{window.Main.sendMessage({name: 'remove_user_request', data: user.id })}}>⛔</button>
        </div>
      );
    }

    return elements;
  }

  return (
    <div>
      <div>
        <label style={textStyle}>User Name</label>
        <input
          onChange={ent => {
            setUserName(ent.currentTarget.value)
          }}
          onKeyPress={ent => {
            ent.code === 'Enter' ? createNewUser() : false
          }}
          type="text"
        />
      </div>
      <div>
        <label>User Token</label>
        <input
          onChange={ent => {
            setUserToken(ent.currentTarget.value)
          }}
          onKeyPress={ent => {
            ent.code === 'Enter' ? createNewUser() : false
          }}
          type="text"
        />
      </div>
      <div>
        <button
          onClick={() => {
            createNewUser()
          }}
        >
          Submit
        </button>
      </div>
      <div>
        {getUserElements()}
      </div>
    </div>
  )
}
