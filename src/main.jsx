import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import 'antd/dist/reset.css';
import { Provider } from 'react-redux';
import { store } from '../store';

import { Toaster } from "react-hot-toast";
createRoot(document.getElementById('root')).render(

    <Provider store={store}>
            <App />
            <Toaster position="top-center" reverseOrder={false} />
    </Provider>
)
