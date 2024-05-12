import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Typography, Button, Container, Grid, TextField } from '@mui/material';

export function SignUp() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const executeSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await auth.signUp(username, email, password);
    if (result.success) {
      navigate({ pathname: '/confirmsignup' });
    } else {
      alert(result.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Grid sx={{ marginTop: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          新規会員登録
        </Typography>

        <form noValidate onSubmit={executeSignUp}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ユーザー名"
                variant="outlined"
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="メールアドレス"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="パスワード"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
          </Grid>
          <Grid sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
            >
              送信
            </Button>
          </Grid>
          <Grid sx={{ textAlign: 'left', mt: 2 }}>
            アカウントをお持ちの方は<Link to="/signin">こちら</Link>
          </Grid>
        </form>
      </Grid>
    </Container>
  );
}