import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Typography, Button, Container, Grid, TextField } from '@mui/material';

export function ConfirmSignUp() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [confirmationCode, setConfirmationCode] = useState('');

  const executeConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await auth.confirmSignUp(confirmationCode);
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
          認証コード確認
        </Typography>

        <form noValidate onSubmit={executeConfirm}>
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