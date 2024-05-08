import { Amplify } from 'aws-amplify';
import * as auth from 'aws-amplify/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import AwsConfigAuth from '../aws-config/auth';

Amplify.configure(AwsConfigAuth);

interface UseAuth {
  isLoading: boolean;
  isAuthenticated: boolean;
  username: string;
  userId: string;
  email: string;
  signUp: (username: string, email: string, password: string)  => Promise<Result>;
  confirmSignUp: (verificationCode: string) => Promise<Result>;
  signIn: (username: string, password: string) => Promise<Result>;
  signOut: () => void;
  fetchUserAttributes: () => Promise<Result>;
  resetPassword: (username: string)  => Promise<Result>;
  confirmResetPassword: (confirmationCode: string, newPassword: string) => Promise<Result>;
}

interface Result {
  success: boolean;
  message: string;
}

const authContext = createContext({} as UseAuth);

export function ProvideAuth({ children }: { children: React.ReactNode }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export const useAuth = () => {
  return useContext(authContext);
};

const useProvideAuth = (): UseAuth => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    auth.getCurrentUser()
      .then((result) => {
        setUserId(result.userId);
        setUsername(result.signInDetails?.loginId!);
        setIsAuthenticated(true);
        setIsLoading(false);
      })
      .catch(() => {
        setUsername('');
        setIsAuthenticated(false);
        setIsLoading(false);
      });
  }, [isAuthenticated]);

  const signUp = async (username: string, email: string, password: string) => {
    try {
      await auth.signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          }
        }
      });
      setUsername(username);
      setEmail(email);
      setPassword(password);
      return { success: true, message: '' };
    } catch (error) {
      return {
        success: false,
        message: '認証に失敗しました。',
      };
    }
  };

  const confirmSignUp = async (confirmationCode: string) => {
    try {
      await auth.confirmSignUp({
        username: username,
        confirmationCode: confirmationCode,
      });
      const result = await signIn(username, password);
      setPassword('');
      return result;
    } catch (error) {
      return {
        success: false,
        message: '認証に失敗しました。',
      };
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      await auth.signIn({username, password});
      setUsername(username);
      setIsAuthenticated(true);
      return { success: true, message: '' };
    } catch (error) {
      return {
        success: false,
        message: '認証に失敗しました。',
      };
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUsername('');
      setUserId('');
      setEmail('');
      setIsAuthenticated(false);
      return { success: true, message: '' };
    } catch (error) {
      return {
        success: false,
        message: 'ログアウトに失敗しました。',
      };
    }
  };

  const fetchUserAttributes = async () => {
    try {
      const userAttributes = await auth.fetchUserAttributes();
      console.log("tes")
      setEmail(userAttributes.email!);
      return { success: true, message: '' };
    } catch (error) {
      return {
        success: false,
        message: 'ユーザー情報取得に失敗しました。',
      };
    }
  };

  const resetPassword = async (username: string) => {
    try {
      await auth.resetPassword({ username });
      setUsername(username);
      return { success: true, message: '' };
    } catch (error) {
      return {
        success: false,
        message: 'パスワード変更に失敗しました。',
      };
    }
  };

  const confirmResetPassword = async (confirmationCode: string, newPassword: string) => {
    try {
      await auth.confirmResetPassword({ username, confirmationCode, newPassword });
      return { success: true, message: '' };
    } catch (error) {
      return {
        success: false,
        message: 'パスワード変更に失敗しました。',
      };
    }
  };

  return {
    isLoading,
    isAuthenticated,
    username,
    userId,
    email,
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    fetchUserAttributes,
    resetPassword,
    confirmResetPassword,
  };
};