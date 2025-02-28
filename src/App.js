import './App.css';
import './components/css/Animations.css';

import AuthProvider from './components/AuthProvider';

import Navbar from './components/js/Navbar';
import DevNotice from './components/js/portalComponents/DevNotice';

import {HashRouter} from 'react-router-dom';
import RouterComponent from './components/Router';

function App() {
  return (
    <>
      <HashRouter>
        <AuthProvider>
          <DevNotice/>
          <Navbar/>
          <div className='app'>
            <RouterComponent/>
          </div>
        </AuthProvider>
      </HashRouter>
    </>
  );
}

export default App;