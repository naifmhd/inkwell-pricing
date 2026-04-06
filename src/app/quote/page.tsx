import { ServicePicker } from '@/components/quote/ServicePicker';

export default function QuotePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-900 mb-2">Get a Quote</h2>
      <p className="text-zinc-500 mb-8">Select the service you need a price for.</p>
      <ServicePicker />
    </div>
  );
}
