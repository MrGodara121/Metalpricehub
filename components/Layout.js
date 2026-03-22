import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import LanguageSelector from './LanguageSelector'

export default function Layout({ children, config, title, description }) {
  return (
    <>
      <Head>
        <title>{title || config?.site_name}</title>
        <meta name="description" content={description || config?.site_description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {config?.google_analytics_id && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${config.google_analytics_id}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${config.google_analytics_id}');
            ` }} />
          </>
        )}
      </Head>
      <Header config={config} />
      <main className="min-h-screen bg-gray-50">{children}</main>
      <Footer config={config} />
    </>
  )
}
