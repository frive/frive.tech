import { getAllPosts } from '../lib/markdown';
import Post from '../types/post';
import React from 'react';
import Posts from './posts';

type Props = {
  allPosts: Post[];
};

const Index = ({ allPosts }: Props) => {
  return <Posts allPosts={allPosts} />;
};

export default Index;

export const getStaticProps = async () => {
  const allPosts = getAllPosts([
    'title',
    'date',
    'slug',
    'author',
    'coverImage',
    'excerpt',
  ]);

  return {
    props: { allPosts },
  };
};
