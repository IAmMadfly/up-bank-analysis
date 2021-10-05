import { GlobalStyle } from './styles/GlobalStyle'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import NewUserInput from './components/NewUserInput'
import AvailableUsers from './components/AvailableUsers'

export function App() {
  return (
    <>
      <GlobalStyle />
      <NewUserInput />
      <AvailableUsers />
    </>
  )
}