'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Cpu, Save } from 'lucide-react';
import { projectService } from '../../services/projectService';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';

export default function AddProject() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'IoT',
    difficulty: 'Beginner',
    price: '',
    codeSnippet: '// C++ Firmware Code\nvoid setup() {\n  Serial.begin(115200);\n}\nvoid loop() {}',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await projectService.createProject({
        ...formData,
        price: Number(formData.price),
      });
      router.push('/projects');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <PageHeader
        title="Create Engineering Project"
        subtitle="Publish a guided DIY tutorial, pinout diagram, and firmware snippet for makers"
        breadcrumbs={[{ label: 'Catalog', href: '/projects' }, { label: 'New Project' }]}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={() => router.push('/projects')}
            icon={ArrowLeft}
          >
            Back to Projects
          </Button>
        }
      />

      <Card className="p-6 sm:p-8 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Title *"
            required
            placeholder="e.g. Smart IoT Plant Watering System"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { label: 'IoT & Connected Devices', value: 'IoT' },
                { label: 'Robotics & Automation', value: 'Robotics' },
                { label: 'Embedded Systems', value: 'Embedded' },
                { label: 'Sensors & Instrumentation', value: 'Sensors' },
              ]}
            />
            <Select
              label="Difficulty Level"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              options={[
                { label: 'Beginner', value: 'Beginner' },
                { label: 'Intermediate', value: 'Intermediate' },
                { label: 'Advanced', value: 'Advanced' },
              ]}
            />
            <Input
              label="Kit Price (₹) *"
              type="number"
              min="0"
              required
              placeholder="e.g. 1299"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <Textarea
            label="Project Overview & BOM Description *"
            rows={4}
            required
            placeholder="Explain the circuit design, core microcontrollers used, and assembly instructions."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Firmware Code Snippet (C++ / MicroPython)
            </label>
            <textarea
              rows={5}
              value={formData.codeSnippet}
              onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
              className="w-full px-4 py-3 text-xs font-mono bg-slate-900 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              icon={Save}
            >
              Publish Engineering Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
