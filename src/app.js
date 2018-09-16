import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './scss/style.scss';

import Editor from './components/Editor';

class App extends React.Component {
  render() {
    return (
      <div>
        <header>
          <h1>My text editor implementation</h1>
        </header>
        <main>
          <Editor />
        </main>
        <footer>
          <p>&copy; Rob Levy</p>
        </footer>
      </div>
    );
  }

}

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>, document.getElementById('root'));

