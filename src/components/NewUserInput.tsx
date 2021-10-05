import { Main } from 'electron'
import { IpcRendererEvent } from 'electron/renderer'
import { useState, useEffect, useRef } from 'react'
// import { ipcRenderer } from 'electron'

export default function () {
  const [userName, setUserName] = useState('')
  const [userToken, setUserToken] = useState('')
  const [textColour, setTextColour] = useState('#fff')
  const userNameInput = useRef(null);
  const userTokenInput = useRef(null);

  useEffect(() => {
    let callback_ids: Array<string> = new Array();
    callback_ids.push(
      window.Main.on(
        'new_user_response', 
        (_: IpcRendererEvent, successful: boolean) => {
          window.Main.sendMessage({name: 'user_names_request', data: null});
          setTextColour(successful ? '#0f0' : '#f00')
        }
      )
    );

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

  return (
    <div>
      <div style={{
        display: "flex", 
        justifyContent: "center", 
        marginTop: "1rem"}}>
        <label style={textStyle}>User Name</label>
        <input
          ref={userNameInput}
          onChange={ent => {
            setUserName(ent.currentTarget.value)
          }}
          onKeyPress={ent => {
            ent.code === 'Enter' ? createNewUser() : false
          }}
          type="text"
        />
      </div>
      <div style={{
        display: "flex", 
        justifyContent: "center"
        }}>
        <label style={textStyle} >User Token</label>
        <input
          ref={userTokenInput}
          onChange={ent => {
            setUserToken(ent.currentTarget.value)
          }}
          onKeyPress={ent => {
            ent.code === 'Enter' ? createNewUser() : false
          }}
          type="text"
        />
      </div>
      <div style={{
        display: "flex", 
        justifyContent: "center"
        }}>
        <button
          style={{
            margin: "1rem"
          }}
          onClick={() => {
            createNewUser()
          }}
        >
          Submit
        </button>
      </div>
    </div>
  )
}
