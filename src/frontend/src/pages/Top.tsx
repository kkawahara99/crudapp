import React from 'react';

export function Top() {
  const commitId = process.env.REACT_APP_COMMIT_HASH;
  
  return (
    <>
      <h1>Hello World!</h1>
      <p>Commit ID: {commitId}</p>
    </>
  );
}