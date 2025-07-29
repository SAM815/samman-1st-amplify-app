"use client";

import { useState, useEffect } from 'react';
import { signUp, signIn, signOut, confirmSignUp, getCurrentUser } from 'aws-amplify/auth';

export default function AuthTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const user = await getCurrentUser();
      setIsSignedIn(true);
      setCurrentUser(user.username);
    } catch {
      setIsSignedIn(false);
      setCurrentUser(null);
    }
  }

  async function handleSignUp() {
    try {
      setMessage('');
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setShowConfirmation(true);
        setMessage('Please check your email for confirmation code');
      }
    } catch (error: any) {
      setMessage(`Sign up error: ${error.message}`);
    }
  }

  async function handleConfirmSignUp() {
    try {
      setMessage('');
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode,
      });

      if (isSignUpComplete) {
        setMessage('Sign up confirmed! You can now sign in.');
        setShowConfirmation(false);
      }
    } catch (error: any) {
      setMessage(`Confirmation error: ${error.message}`);
    }
  }

  async function handleSignIn() {
    try {
      setMessage('');
      await signIn({
        username: email,
        password,
      });
      await checkUser();
      setMessage('Successfully signed in!');
    } catch (error: any) {
      setMessage(`Sign in error: ${error.message}`);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      await checkUser();
      setMessage('Successfully signed out!');
    } catch (error: any) {
      setMessage(`Sign out error: ${error.message}`);
    }
  }

  return (
    <div className="auth-test-container" style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Authentication Test</h2>
      
      {isSignedIn ? (
        <div>
          <p>Signed in as: <strong>{currentUser}</strong></p>
          <button onClick={handleSignOut} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          {showConfirmation && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Confirmation Code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
              />
              <button onClick={handleConfirmSignUp} style={{ width: '100%', padding: '0.5rem' }}>
                Confirm Sign Up
              </button>
            </div>
          )}

          {!showConfirmation && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleSignUp} style={{ flex: 1, padding: '0.5rem' }}>
                Sign Up
              </button>
              <button onClick={handleSignIn} style={{ flex: 1, padding: '0.5rem' }}>
                Sign In
              </button>
            </div>
          )}
        </div>
      )}

      {message && (
        <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: message.includes('error') ? '#fee' : '#efe', color: message.includes('error') ? '#c00' : '#060', borderRadius: '4px' }}>
          {message}
        </div>
      )}
    </div>
  );
}