import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ContentProvider } from './context/ContentContext'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ContentProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ContentProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
