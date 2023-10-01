// import { useState } from 'react'
import './scss/main.scss';

import Header from './components/Header';
import Introduction from './components/Introduction';
import About from './components/About';
import Services from './components/Services';
import Footerpage from './components/Footerpage';

import Login from './components/Login';
import Signup from './components/Signup';

import User from './components/User';
import Chatbot from './components/Chatbot';

// import {Routes, Route} from 'react-router-dom'
import { createBrowserRouter, RouterProvider, Route, Link } from 'react-router-dom';

const router = createBrowserRouter([
	{
		path: '/',
		element: (
			<div>
				<h1>Hello World</h1>
				<Link to='about'>About Us</Link>
			</div>
		),
	},
	{
		path: 'login',
		element: <Login />,
	},
	{
		path: 'signup',
		element: <Signup />,
	},
	{
		path: 'loggedin',
		element: <User />,
	},
	{
		path: 'chatbot',
		element: <Chatbot />,
	},
]);

function App() {
	return (
		<>
			<RouterProvider router={router} />
		</>
	);
}
export default App;