import React, { memo } from 'react'
import {renderRoutes} from 'react-router-config'
import { BrowserRouter, HashRouter } from 'react-router-dom';
import routes from './router'

import LSHAppHeader from '@/components/app-header'

export default memo(function App() {
  return (
    <HashRouter>
      <LSHAppHeader/>
      {renderRoutes(routes)}
    </HashRouter>
  )
})
