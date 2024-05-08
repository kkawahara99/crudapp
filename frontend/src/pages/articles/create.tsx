import React, { useState } from 'react';
import { Typography, Checkbox, FormControlLabel, Button, Container, Grid, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../../hooks/use-auth";
import PrivateRoute from "../../components/PrivateRoute";

const ArticleCreate: React.FC = () => {
  // フォーム入力の状態を管理するための state
  const [title, setTitle] = useState<string>('');
  const [contents, setContents] = useState<string>('');
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const navigate = useNavigate();
  const auth = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  // フォームの送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await axios
      .post(`${apiUrl}/articles/`, {
          title: title,
          contents: contents,
          isPublished: isPublished,
          createdBy: auth.userId,
          updatedBy: auth.userId,
        }, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
      })
      .catch((e) => {
        console.log(e.message);
      });
    navigate({ pathname: '/articles' });
  };

  // キャンセル処理
  const handleCancel = () => {
    navigate({ pathname: '/articles' });
  };

  return (
    <PrivateRoute>
      <Container maxWidth="xs">
        <Grid sx={{ marginTop: 8 }}>
          <Typography variant="h5" align="center" gutterBottom>
            記事作成
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="タイトル"
                  variant="outlined"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="内容"
                  variant="outlined"
                  value={contents}
                  multiline
                  placeholder='複数行入力できます'
                  minRows={3}
                  maxRows={20}
                  onChange={(e) => setContents(e.target.value)}
                />
              </Grid>
            </Grid>
            <FormControlLabel
              control={<Checkbox checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />}
              label="公開する"
            />
            <div style={{ marginTop: '16px' }}>
              <Button type="submit" variant="contained" sx={{ marginRight: '8px' }}>投稿</Button>
              <Button type="button" variant="outlined" onClick={handleCancel}>キャンセル</Button>
            </div>
          </form>
        </Grid>
      </Container>
    </PrivateRoute>
  );
};

export default ArticleCreate;
