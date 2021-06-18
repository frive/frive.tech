import remark from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';
import codeTitle from 'remark-code-titles';

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(codeTitle)
    .use(prism)
    .use(html)
    .process(markdown);

  return result.toString();
}
