import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Breadcrumb from './components/Breadcrumb';
import { useAuth } from './hooks/use-auth';
import { Top } from './pages/Top';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ConfirmSignUp } from './pages/ConfirmSignUp';
import { ResetPassword } from './pages/ResetPassword';
import { ConfirmResetPassword } from './pages/ConfirmResetPassword';
import { Articles } from './pages/articles';
import ArticleCreate from './pages/articles/Create';
import ArticleUpdate from './pages/articles/Update';

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>...Loading</div>;
  }

  return (
    <BrowserRouter>
      <Header />
      <div style={{ marginTop: '80px' }}>
        <Breadcrumb />
        <Routes>
          <Route index element={<Top />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/confirmsignup" element={<ConfirmSignUp />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/confirmresetpassword" element={<ConfirmResetPassword />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/create" element={<ArticleCreate />} />
          <Route path="/articles/update" element={<ArticleUpdate />} />
          <Route path="*" element={<p>Page Not Found</p>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
