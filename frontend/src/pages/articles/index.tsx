import React from 'react';
import { Container, Button, Card, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AddCircle, Edit, Delete } from '@mui/icons-material';
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/use-auth";

type ArticleType = {
  id: string;
  title: string;
  contents: string;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export function Articles() {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [selectedArticleTitle, setSelectedArticleTitle] = useState<string>("");
  const navigate = useNavigate();
  const auth = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleGet = () => {
    axios
      .get(`${apiUrl}/articles`, {
        headers: {
          "Cache-Control": "no-cache",
        },
        params: {
          userId: auth.userId,
        }
      })
      .then((response) => {
        setArticles(response.data);
      })
      .catch((e) => {
        console.log(e.message);
      });
  };

  const handleCreate = () => {
    navigate({ pathname: '/articles/create' });
  };

  const handleUpdate = (id: string) => {
    navigate(`/articles/update`, {
      state: {
        articleId: id
      }
    });
  };

  const handleDeleteClick = (id: string, title: string) => {
    setSelectedArticleId(id);
    setSelectedArticleTitle(title);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await axios
      .delete(`${apiUrl}/articles/${id}`)
      .then((response) => {
        setOpen(false);
      })
      .catch((e) => {
        console.log(e.message);
      });
    handleGet();
  };

  useEffect(() => {
    handleGet();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  return (
    <Container maxWidth="xs">
      <h1>記事一覧</h1>
      {auth.isAuthenticated &&
        <Button variant="contained" onClick={handleCreate}>
          <AddCircle /> 新規作成
        </Button>
      }
      {articles.length > 0 ?
        articles.map((article) => (
          <Card sx={{ marginTop: 2 }} key={article.id}>
            <h3>{article.title}</h3>
            <p>{article.contents}</p>
            {article.is_published ? 
              <div>公開中</div>
              :
              <div>非公開</div>
            }
            <div>作成日時: {(new Date(article.created_at)).toLocaleString()}</div>
            <div>更新日時: {(new Date(article.updated_at)).toLocaleString()}</div>

            {auth.isAuthenticated &&
              <Grid container justifyContent="flex-end" spacing={2}>
                <Button onClick={() => handleUpdate(article.id)}>
                  <Edit />
                </Button>
                <Button
                  onClick={() => handleDeleteClick(article.id, article.title)}
                  color="error"
                >
                  <Delete />
                </Button>
              </Grid>
            }
          </Card>
        )) : (
          <p>記事がありません</p>
        )}

      {/* 確認用のダイアログ */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>記事の削除</DialogTitle>
        <DialogContent>
          <p>タイトル: {selectedArticleTitle}</p>
          <p>本当にこの記事を削除しますか？</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>キャンセル</Button>
          <Button onClick={() => handleDelete(selectedArticleId)} color="error">削除</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}