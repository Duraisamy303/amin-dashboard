import type { AppProps } from 'next/app';
import { ReactElement, ReactNode, Suspense } from 'react';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { Provider } from 'react-redux';
import store from '../store/index';
import Head from 'next/head';

import { appWithI18Next } from 'ni18n';
import { ni18nConfig } from 'ni18n.config.ts';
import { setContext } from '@apollo/client/link/context';

// Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css';

import '../styles/tailwind.css';
import { NextPage } from 'next';
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from '@apollo/client';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
    const httpLink = createHttpLink({
        uri: 'http://file.prade.in/graphql/',
    });

    const authLink = setContext((_, { headers }) => {
        const token = localStorage.getItem('token');

        return {
            headers: {
                ...headers,
                Authorization: token ? `JWT ${token}` : '',
            },
        };
    });

    const client = new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(),
    });
    const getLayout = Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

    return (
        <ApolloProvider client={client}>
            <Provider store={store}>
                <Head>
                    <title>PRADE - Admin</title>
                    <meta charSet="UTF-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta name="description" content="Generated by create next app" />
                    <link rel="icon" href="/favicon.png" />
                </Head>

                {getLayout(<Component {...pageProps} />)}
            </Provider>
        </ApolloProvider>
    );
};
export default appWithI18Next(App, ni18nConfig);
