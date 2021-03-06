import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Container from '../../components/container';
import PostBody from '../../components/post-body';
import PostHeader from '../../components/post-header';
import Layout from '../../components/layout';
import { getPostBySlug, getAllPosts } from '../../lib/markdown';
import PostTitle from '../../components/post-title';
import Head from 'next/head';
import markdownToHtml from '../../lib/markdownToHtml';
import PostType from '../../types/post';
import { SITE_NAME } from '../../lib/constants';

type Props = {
  post: PostType;
  morePosts: PostType[];
  preview?: boolean;
};

const Post = ({ post, morePosts, preview }: Props) => {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout preview={preview}>
      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="">
              <Head>
                <title>
                  {SITE_NAME} | {post.title}
                </title>
                <meta content={post.excerpt} name="description" />
                <meta
                  property="og:url"
                  content={`https://frive.tech${router.asPath}`}
                />
                <link
                  rel="canonical"
                  href={`https://frive.tech${router.asPath}`}
                />
                <meta property="og:type" content="article" />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:title" content={post.title} />
                {/* <meta property="og:image" content={post.coverImage} /> */}
                {post.date && (
                  <meta property="article:published_time" content={post.date} />
                )}
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post.author}
                readingTime={post.readingTime}
              />
              <div className="py-8">
                <PostBody content={post.content} />
              </div>
            </article>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Post;

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug, [
    'title',
    'date',
    'excerpt',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
  ]);
  const content = await markdownToHtml(post.content || '');

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug']);

  return {
    paths: posts.map((posts) => {
      return {
        params: {
          slug: posts.slug,
        },
      };
    }),
    fallback: false,
  };
}
