import { GlobalStyle } from './styles/GlobalStyle'

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