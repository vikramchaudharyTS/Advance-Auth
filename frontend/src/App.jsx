//@ts-nocheck
import React, { useEffect } from 'react'
import FloatingShape from './components/FloatingShape'
import LoadingSpinner from './components/LoadingSpinner'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignupPage from './Pages/SignupPage'
import LoginPage from './Pages/LoginPage'
import Dashboard from './Pages/Dashboard'
import EmailVerificationPage from './Pages/EmailVerificationPage'
import ForgotPasswordPage from './Pages/ForgotPassworPage'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import ResetPasswordPage from './Pages/ResetPasswordPage'


// protect routes that require authentication
const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to='/login' replace />

  if (!user.isVerified) return <Navigate to='/verify-email' replace />

  return children;
}

// redirect authenticated users users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user.isVerified) {
    return <Navigate to='/' replace />
  }

  return children;
}
function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isCheckingAuth) return <LoadingSpinner />

  return (
    <>

      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden'>
        <FloatingShape color='bg-green-500' size='w-64 h-64' top='-5' left='10%' delay={0} />
        <FloatingShape color='bg-emerald-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
        <FloatingShape color='bg-lime-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />
      </div>


      <div className='absolute inset-0 flex items-center justify-center w-full'>
        <Routes>
          <Route path='/' element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>} />
          <Route path='/signup' element={<RedirectAuthenticatedUser><SignupPage /></RedirectAuthenticatedUser>} />
          <Route path='/login' element={<RedirectAuthenticatedUser><LoginPage /></RedirectAuthenticatedUser>} />
          <Route path='/verify-email' element={<EmailVerificationPage />} />
          <Route path='/forgot-password' element={<RedirectAuthenticatedUser><ForgotPasswordPage /></RedirectAuthenticatedUser>} />
          <Route path='/reset-password/:token' element={<RedirectAuthenticatedUser><ResetPasswordPage /></RedirectAuthenticatedUser>} />
        </Routes>
      </div>
      <Toaster />
    </>
  )
}

export default App