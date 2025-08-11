import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";
import i18n from "@/lib/i18n";

class MyDocument extends Document<{ lang: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    const lang = i18n.language || i18n.options.fallbackLng || "cs";

    return { ...initialProps, lang: Array.isArray(lang) ? lang[0] : lang };
  }

  render() {
    return (
      <Html lang={this.props.lang}>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="antialiased overscroll-none">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
