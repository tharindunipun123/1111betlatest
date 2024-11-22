import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter ,Route , Routes } from 'react-router-dom';
import HomePage from './components/HomePage'
import SpinWheel from './SpinWheel'
import Register from './components/Register';
import Login from './components/loginCmp';
import LuckyNumber from './luckynumber';
import CricketBetting from './cricketbet';
import DiceRoller from './dice';
import WithdrawalRequest from './withdraw';
import PaymentReceipt from './payment';
import DiceRollingGame from './dice';



function App() {
 //basename="/wheel"
  return (
     <BrowserRouter basename="/bet">
    <Routes>
    <Route path="/" element={<Login/>}> </Route>
    <Route path="/login" element={<Login/>}> </Route>
    <Route path="/home" element={<HomePage/>}> </Route>
    <Route path="/spinwheel" element={<SpinWheel />} />
    <Route path="/register" element={<Register />} />
    <Route path="/lucky" element={<LuckyNumber />} />
    <Route path="/cricket" element={<CricketBetting />} />
    <Route path="/dice" element={<DiceRollingGame />} />
    <Route path="/payment" element={<PaymentReceipt />} />
    <Route path="/withdraw" element={<WithdrawalRequest />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
