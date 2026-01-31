import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import App from './App.tsx'
import './index.css';
import client from './gql/client';
import { ConfigProvider } from 'antd';
import './config';
import theme from './config/theme';
import { ContextProvider } from './context';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={theme}>
      <ApolloProvider client={client}>
        <ContextProvider>
          <App />
        </ContextProvider>
      </ApolloProvider>
    </ConfigProvider>
  </StrictMode>,
)
