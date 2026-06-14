import React from 'react';
import './App.css';
import ConfigBuilder from './components/ConfigBuilder';
import './components/index.css';

function App() {
  return (
    <div className='App'>
      <h1 className='test'>YAML/JSON Creator</h1>
      <ConfigBuilder />
    </div>
  );
}

export default App;
