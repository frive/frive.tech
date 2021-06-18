import Avatar from "./avatar";
import DateFormatter from "./date-formatter";
import CoverImage from "./cover-image";
import Link from "next/link";
import Author from "../types/author";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
  readingTime: string;
};

const PostPreview = ({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  readingTime,
}: Props) => {
  return (
    <div>
      <p className="text-xl mb-3 leading-snug">
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a className="hover:underline">{title}</a>
        </Link>
      </p>
      <div className="text-sm mb-4 text-gray-500 dark:text-gray-400">
        <DateFormatter dateString={date} /> • ☕️ {readingTime}
      </div>
      <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {excerpt}
      </p>
    </div>
  );
};

export default PostPreview;
