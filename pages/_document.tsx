import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body className="antialiased pt-safe overscroll-none px-safe pb-safe min-h-screen bg-gradient-to-b from-pink-600 to-slate-900">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
