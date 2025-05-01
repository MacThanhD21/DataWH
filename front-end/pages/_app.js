"use client";

import { GlobalStyle } from '../src/styled-components';

export default function App({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
} 