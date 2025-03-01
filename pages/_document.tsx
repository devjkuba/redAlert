import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body className="antialiased overscroll-none min-h-screen">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
