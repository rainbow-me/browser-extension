import './global.css.ts';
import React, { Fragment, useEffect } from 'react';
import { initThemingBody, initThemingCritical } from './components';

export default ({ children, themeName }) => {
  useEffect(() => {
    initThemingCritical({ defaultTheme: themeName, enableSaved: false });
    initThemingBody()
  }, [])
  return (
    <div className="test">
      {children}
    </div>
  );
} 