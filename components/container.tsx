import { ReactNode, FunctionComponent } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

type Props = {
  children?: ReactNode;
};

const Container: FunctionComponent = ({ children }: Props) => {
  return (
    <div className="container max-w-2xl mx-auto md:mb-10 p-8 w-full">
      {children}
    </div>
  );
};

export default Container;
