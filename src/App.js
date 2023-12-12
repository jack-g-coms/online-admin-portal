import './App.css';
import './components/css/Animations.css';

import AuthProvider from './components/AuthProvider';

import Navbar from './components/js/Navbar';
import DevNotice from './components/js/portalComponents/DevNotice';

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import RouterComponent from './components/Router';

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <DevNotice/>
          <Navbar/>
          <div className='app'>
            <RouterComponent/>
          </div>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;