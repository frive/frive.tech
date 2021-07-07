import remark from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';
import codeTitle from 'remark-code-titles';

const slug = require('remark-slug');
const headings = require('remark-autolink-headings');

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(slug)
    .use(headings, {
      linkProperties: {
        className: ['anchor'],
      },
    })
    .use(codeTitle)
    .use(prism)
    .use(html)
    .process(markdown);

  return result.toString();
}
