const AwsConfigAuth = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_AUTH_USER_POOL_ID || "",
      userPoolClientId: process.env.REACT_APP_AUTH_USER_POOL_CLIENT_ID || "",
    }
  }
}

export default AwsConfigAuth;