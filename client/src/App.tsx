import './App.css'
import Meet from './components/meet/Meet.tsx'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CreateMeet from './components/meet/CreateMeet.tsx'
import React from 'react'

const App: React.FC = (): JSX.Element => {

  return (
    <>
      <BrowserRouter>
        <Routes >
          <Route element={<CreateMeet />} path='/'></Route>
          <Route element={<Meet />} path='/meet/:meetID'></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
