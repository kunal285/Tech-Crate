import ProjectDetails from '@/views/projects/ProjectDetails';

export const metadata = {
  title: 'Project Details — Tech Crate Admin',
};

export default async function ProjectDetailsRoute({ params }) {
  const resolvedParams = await params;
  return <ProjectDetails projectId={resolvedParams?.id} />;
}
