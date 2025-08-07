import { CardSkeleton } from '@/components/ui/loading-skeleton';
export default function Loading() {
  return (
    <div className="space-y-6">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
