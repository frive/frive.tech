import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import ActiveLink from '../components/active-link';
import { AVATAR_URL } from '../lib/constants';

type Props = {
  className?: string;
};

const Header = ({}: Props) => {
  const { setTheme, resolvedTheme } = useTheme();
  const { pathname } = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleDarkMode = (checked: boolean) => {
    const isDarkMode = checked;

    if (isDarkMode) setTheme('dark');
    else setTheme('light');
  };

  const isRoot = pathname === '/';
  const isDarkMode = resolvedTheme === 'dark';
  const darkModeSwitchStyle = {
    display: 'inline',
  };

  return (
    <nav className="navbar max-w-4xl w-full p-4 md:p-10 my-0 mx-auto bg-opacity-40 bg-white dark:bg-black">
      <h1 className="flex flex-col items-center md:flex-row md:justify-between text-md font-bold tracking-tight md:tracking-tighter leading-tight my-0">
        {/* <Link href="/">
          <a>
            <img src={AVATAR_URL} className="rounded-full w-8" />
          </a>
        </Link> */}
        {mounted && (
          <>
            <DarkModeSwitch
              checked={isDarkMode}
              onChange={toggleDarkMode}
              size={20}
              style={darkModeSwitchStyle}
            />
            <br className="md:hidden" />
            <div className="space-x-4 dark:text-white">
              <ActiveLink activeClassName="text-blue-1" href="/">
                <a className="hover:text-blue-1">home</a>
              </ActiveLink>
              <ActiveLink activeClassName="text-blue-1" href="/about">
                <a className="hover:text-blue-1">about</a>
              </ActiveLink>
              <ActiveLink activeClassName="text-blue-1" href="/projects">
                <a className="hover:text-blue-1">projects</a>
              </ActiveLink>
              {/* <ActiveLink activeClassName="text-blue-1" href="/posts">
            <a className="hover:text-blue-1">posts</a>
          </ActiveLink>{" "} */}
            </div>
          </>
        )}
      </h1>
    </nav>
  );
};

export default Header;
