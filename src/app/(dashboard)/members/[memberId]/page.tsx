interface MemberIdPageProps {
  params: Promise<{ memberId: string }>;
}

const MemberIdPage = async ({ params }: MemberIdPageProps) => {
  const { memberId } = await params;
  
  return <div>MemberIdPage</div>;
};

export default MemberIdPage;
