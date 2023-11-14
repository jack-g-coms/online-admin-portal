import './App.css';
import './components/css/Animations.css';

import AuthProvider from './components/AuthProvider';

import Navbar from './components/js/Navbar';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import RouterComponent from './components/Router';

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
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