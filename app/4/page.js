import BoardPage, { boardMetadata } from '@/components/BoardPage';

export const dynamic = 'force-dynamic'; // a tartalom cache-elt, mentéskor ürül
export const generateMetadata = boardMetadata;

export default function Page() {
  return <BoardPage idx={3} />;
}
