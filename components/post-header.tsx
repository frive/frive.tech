import Avatar from "./avatar";
import DateFormatter from "./date-formatter";
import CoverImage from "./cover-image";
import PostTitle from "./post-title";
import Author from "../types/author";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  author: Author;
  readingTime: string;
};

const PostHeader = ({
  title,
  coverImage,
  date,
  author,
  readingTime,
}: Props) => {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      {/* <div className="hidden md:block">
        <Avatar name={author.name} picture={author.picture} />
      </div> */}
      <div className="max-w-2xl mx-auto">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <DateFormatter dateString={date} /> • ☕️ {readingTime}
        </div>
      </div>
    </>
  );
};

export default PostHeader;
