'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Box, Save } from 'lucide-react';
import { projectService } from '../../services/projectService';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

export default function AddProjectKit() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'IoT',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await projectService.createProject({
        ...formData,
        price: Number(formData.price),
      });
      router.push('/project-kits');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create kit package');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <PageHeader
        title="Create Turn-key Kit Package"
        subtitle="Bundle curated microcontrollers, sensors, cables, and packaging into a single sellable SKU"
        breadcrumbs={[{ label: 'Catalog', href: '/project-kits' }, { label: 'New Kit' }]}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={() => router.push('/project-kits')}
            icon={ArrowLeft}
          >
            Back to Kits
          </Button>
        }
      />

      <Card className="p-6 sm:p-8 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Kit Package Title *"
            required
            placeholder="e.g. Smart Agriculture & Soil Telemetry Kit"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Input
            label="Kit Price (₹) *"
            type="number"
            min="0"
            required
            placeholder="e.g. 1499"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />

          <Textarea
            label="Kit Description & Included Components *"
            rows={4}
            required
            placeholder="Itemize all hardware included inside the anti-static packaging (boards, jumper wires, sensors, battery clips)."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              icon={Save}
            >
              Save & Publish Kit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
