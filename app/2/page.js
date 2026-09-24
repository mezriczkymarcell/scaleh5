import BoardPage, { boardMetadata } from '@/components/BoardPage';

export const revalidate = 3600; // mentéskor azonnal frissül
export const generateMetadata = boardMetadata;

export default function Page() {
  return <BoardPage idx={1} />;
}
