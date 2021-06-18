import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Container from '../../components/container';
import PostBody from '../../components/post-body';
import PostHeader from '../../components/post-header';
import Layout from '../../components/layout';
import { getPostBySlug, getAllPosts } from '../../lib/markdown';
import Head from 'next/head';
import Post from '../../types/post';
import PostPreview from '../../components/post-preview';
import { SITE_NAME } from '../../lib/constants';

type Props = {
  allPosts: Post[];
};

const Posts = ({ allPosts }: Props) => {
  return (
    <Layout>
      <Head>
        <title>{SITE_NAME}</title>
      </Head>
      <Container>
        <div className="flex flex-col space-y-10">
          {allPosts.map((post) => (
            <PostPreview key={post.slug} {...post} />
          ))}
        </div>
      </Container>
    </Layout>
  );
};

export default Posts;

export const getStaticProps = async () => {
  const allPosts = getAllPosts([
    'title',
    'date',
    'slug',
    'author',
    'coverImage',
    'excerpt',
    'readingTime',
  ]);

  return {
    props: { allPosts },
  };
};
