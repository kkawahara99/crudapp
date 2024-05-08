import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Typography, Button, Container, Grid, TextField } from '@mui/material';

export function SignIn() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const executeSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await auth.signIn(username, password);
    if (result.success) {
      navigate({ pathname: '/' });
    } else {
      alert(result.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Grid sx={{ marginTop: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          ログイン
        </Typography>

        <form noValidate onSubmit={executeSignIn}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ユーザー名またはメールアドレス"
                variant="outlined"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              ログイン
            </Button>
          </Grid>
          <Grid sx={{ textAlign: 'left', mt: 2 }}>
            新規登録は<Link to="/signup">こちら</Link>
          </Grid>
          <Grid sx={{ textAlign: 'left', mt: 2 }}>
            <Link to="/resetpassword">パスワードを忘れた</Link>
          </Grid>
        </form>
      </Grid>
    </Container>
  );
}