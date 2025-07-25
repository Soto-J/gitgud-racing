interface ProfileIdPageProps {
  params: Promise<{ memberId: string }>;
}
const ProfileIdPage = async ({ params }: ProfileIdPageProps) => {
  const { memberId } = await params;

  return <div>ProfileIdPage {memberId}</div>;
};

export default ProfileIdPage;
