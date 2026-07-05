import * as React from 'react';
import { AppProps } from 'next/app';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../emotionCache';

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

// Un cache est créé côté client pour être utilisé par l'application.
const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props: MyAppProps) {
  // Utilise le cache du serveur pendant le SSR, sinon le cache client.
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Component {...pageProps} />
    </CacheProvider>
  );
}
