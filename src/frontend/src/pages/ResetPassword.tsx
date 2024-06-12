import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Typography, Button, Container, Grid, TextField } from '@mui/material';

export function ResetPassword() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  const executeResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await auth.resetPassword(username);
    if (result.success) {
      navigate({ pathname: '/confirmresetpassword' });
    } else {
      alert(result.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Grid sx={{ marginTop: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          パスワード初期化
        </Typography>

        <form noValidate onSubmit={executeResetPassword}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ユーザー名またはメールアドレス"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
          <Grid sx={{ textAlign: 'center', mt: 2 }}>
            <Link to="/signin">ログインに戻る</Link>
          </Grid>
        </form>
      </Grid>
    </Container>
  );
}