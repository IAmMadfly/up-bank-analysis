import { GlobalStyle } from './styles/GlobalStyle'
import { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import NewUserInput from './components/NewUserInput'
import AvailableUsers from './components/AvailableUsers'

export function App() {

  const [userId, setUserId] = useState(null)

  const NewUser = () => {
    return (
      <div>
        <GlobalStyle />
        <NewUserInput />
        <AvailableUsers />
      </div>
    )
  }

  const UserInformation = () => {
    return (
      <div>
        <p>User information</p>
      </div>
    )
  }

  console.log("URL:", window.location)

  return (
    <>
      <Router>
        <Route exact path="/main_window" >
          <NewUser/>
        </Route>
        {/* <Route exact path="/userinfo">
          <UserInformation/>
        </Route> */}
      </Router>
    </>
  )
}