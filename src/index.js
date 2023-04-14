import React from 'react';
//import ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import * as serviceWorker from './serviceWorker';

const container = document.getElementById('root');

const root = ReactDOMClient.createRoot(container);

root.render(<App />);

//ReactDOM.render(<App />, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
