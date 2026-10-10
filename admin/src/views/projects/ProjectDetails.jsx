'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Cpu, Code, Layers } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function ProjectDetails() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <PageHeader
        title="Project Schematic & Specifications"
        subtitle={`Firmware blueprint and component assembly dossier for ID: ${id}`}
        breadcrumbs={[{ label: 'Catalog', href: '/projects' }, { label: 'Project Blueprint' }]}
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

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm">
                IoT System
              </Badge>
              <Badge variant="neutral" size="sm">
                Intermediate
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Smart Home Automation System Kit
            </h2>
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            ₹1,499
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
            Embedded Firmware Sketch (C++ / Arduino)
          </span>
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto shadow-inner">
            <pre>{`// ESP32 Smart Home Firmware Blueprint\n#include <WiFi.h>\n#define RELAY_PIN 12\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(RELAY_PIN, OUTPUT);\n  digitalWrite(RELAY_PIN, LOW);\n}\n\nvoid loop() {\n  // Telemetry loop\n}`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
