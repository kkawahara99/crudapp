import React from 'react';
import { Breadcrumbs } from '@mui/material';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function Breadcrumb() {
  const location = useLocation();
  const pathElements = location.pathname.split("/").filter(Boolean); // 空の要素を除外

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link to="/">
        トップページ
      </Link>
      {pathElements.map((path, index) => {
        // 最後の要素の場合はリンクを貼らない
        const isLast = index === pathElements.length - 1;
        const fullPath = `/${pathElements.slice(0, index + 1).join('/')}`;

        if (!isLast) {
          return (
            <Link key={index} to={fullPath}>
              {path}
            </Link>
          );
        } else {
          return (
            <span key={index}>{path}</span> // 最後の要素の場合はリンクを貼らない
          );
        }
      })}
    </Breadcrumbs>
  );
}