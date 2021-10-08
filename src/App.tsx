import { GlobalStyle } from './styles/GlobalStyle'
import { useState } from 'react'

import NewUserInput from './components/NewUserInput'
import AvailableUsers from './AvailableUsers'
import UserInfoHome from './components/UserInfoHome'
import { SetStateAction, Dispatch } from 'hoist-non-react-statics/node_modules/@types/react'

type ReactNullNumberState = [
  SetStateAction<null> |
  SetStateAction<number>, 
  Dispatch<SetStateAction<null>> | 
  Dispatch<SetStateAction<number>>
];

export function App() {

  const [userId, setUserId]: ReactNullNumberState = useState(null);

  const NewUser = () => {
    return (
      <div>
        <GlobalStyle />
        <NewUserInput />
        <AvailableUsers setUserId={setUserId} />
      </div>
    )
  }

  const isUserChosen = () => {
    if (userId) {
      return (<UserInfoHome userId={userId} />)
    } else {
      return (<NewUser />)
    }
  }

  return (
    <>
      {
        isUserChosen()
      }
    </>
  )
}