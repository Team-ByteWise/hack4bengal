import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Layout from "./Layout.jsx"


import {Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from "react-router-dom"
import Home from './Page/Home.jsx'
import Site from './Page/Site.jsx'
import Team from './Page/Team.jsx'
const router=createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout/>}>
      <Route path='' element={<Home/>}/>
      <Route path='/site' element={<Site/>}/>
      <Route path='/team' element={<Team/>}/>

    </Route>

  )

)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
