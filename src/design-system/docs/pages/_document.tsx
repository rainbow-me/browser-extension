import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import * as React from 'react';

// @ts-expect-error
import initThemingCritical from 'raw-loader!../public/initThemingCritical.mjs';
// @ts-expect-error
import initThemingBody from 'raw-loader!../public/initThemingBody.mjs';

function ThemingScript({ source }: { source: string }) {
  const code = source.replace(
    /export \{ (.) as .* \}/,
    '$1()',
  );
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `try { ${code} } catch(e) {}`,
      }}
    />
  );
}

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <ThemingScript source={initThemingCritical} />
        </Head>
        <body>
          <Main />
          <NextScript />
          <ThemingScript source={initThemingBody} />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
