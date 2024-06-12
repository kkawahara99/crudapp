import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Typography, Button, Container, Grid, TextField } from '@mui/material';

export function ConfirmResetPassword() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const executeResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await auth.confirmResetPassword(confirmationCode, newPassword);
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
          パスワード初期化（確認）
        </Typography>

        <form noValidate onSubmit={executeResetPassword}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="認証コード"
                variant="outlined"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="新しいパスワード"
                variant="outlined"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
        </form>
      </Grid>
    </Container>
  );
}