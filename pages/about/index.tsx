import Head from 'next/head';
import Container from '../../components/container';
import Layout from '../../components/layout';
import PostBody from '../../components/post-body';
import { getAbout } from '../../lib/markdown';
import { SITE_NAME } from '../../lib/constants';
import markdownToHtml from '../../lib/markdownToHtml';

interface Props {
  mdContent: string;
}

const About = ({ mdContent }: Props) => {
  return (
    <Layout>
      <Head>
        <title>{SITE_NAME} | about</title>
      </Head>
      <Container>
        <article className="">
          <PostBody content={mdContent} />
        </article>
      </Container>
    </Layout>
  );
};

export default About;

export async function getStaticProps() {
  const content = getAbout();
  const mdContent = await markdownToHtml(content || '');

  return {
    props: {
      mdContent,
    },
  };
}
