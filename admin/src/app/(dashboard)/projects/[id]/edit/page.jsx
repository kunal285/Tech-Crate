import EditProject from '@/views/projects/EditProject';

export const metadata = {
  title: 'Edit Engineering Project — Tech Crate Admin',
};

export default async function EditProjectRoute({ params }) {
  const resolvedParams = await params;
  return <EditProject projectId={resolvedParams?.id} />;
}
