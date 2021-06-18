import Container from '../../components/container';
import Layout from '../../components/layout';
import Head from 'next/head';
import ProjectCard from '../../components/project-card';
import { projects } from '../../data/project';
import { SITE_NAME } from '../../lib/constants';

const Projects = () => {
  return (
    <Layout>
      <Head>
        <title>{SITE_NAME} | projects</title>
      </Head>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {projects
            .sort((proj1, proj2) =>
              proj1.createdAt > proj2.createdAt ? -1 : 1
            )
            .map((project, i) => (
              <ProjectCard project={project} key={`proj-${i}`} />
            ))}
        </div>
      </Container>
    </Layout>
  );
};

export default Projects;
