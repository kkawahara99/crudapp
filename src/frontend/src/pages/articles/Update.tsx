import React from 'react';
import { useEffect, useState } from "react";
import { Typography, Checkbox, FormControlLabel, Button, Container, Grid, TextField } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../../hooks/use-auth";
import PrivateRoute from "../../components/PrivateRoute";

const ArticleUpdate: React.FC = () => {
  const [title, setTitle] = useState<string>();
  const [contents, setContents] = useState<string>();
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = location.state.articleId;
    await axios
      .put(`${apiUrl}/articles/${id}`, {
          id: id,
          title: title,
          contents: contents,
          isPublished: isPublished,
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

  useEffect(() => {
    const id = location.state.articleId;
    axios
      .get(`${apiUrl}/articles/${id}`)
      .then(response => {
        const { title, contents, is_published } = response.data[0];
        setTitle(title);
        setContents(contents);
        setIsPublished(is_published as boolean);
      })
      .catch(error => {
        console.error('記事情報の取得に失敗しました:', error.message);
      });
  }, [location.state.articleId, apiUrl]);

  if (title === undefined) {
    return <div>記事を読み込んでいます...</div>;
  } else {
    return (
      <PrivateRoute>
        <Container maxWidth="xs">
          <Grid sx={{ marginTop: 8 }}>
            <Typography variant="h5" align="center" gutterBottom>
              記事更新
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
                control={<Checkbox checked={!!isPublished} onChange={(e) => setIsPublished(e.target.checked)} />}
                label="公開する"
              />
              <div style={{ marginTop: '16px' }}>
                <Button type="submit" variant="contained" sx={{ marginRight: '8px' }}>更新</Button>
                <Button type="button" variant="outlined" onClick={handleCancel}>キャンセル</Button>
              </div>
            </form>
          </Grid>
        </Container>
      </PrivateRoute>
    );
  }

};

export default ArticleUpdate;
