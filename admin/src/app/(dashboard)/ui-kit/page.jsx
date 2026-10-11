'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Checkbox, Switch } from '@/components/ui/Checkbox';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card, StatCard } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import {
  Palette,
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';

export default function UIKitPage() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [inputText, setInputText] = useState('');
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [switchVal, setSwitchVal] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sampleTableData = [
    { _id: '1', sku: 'TC-ESP32-WROOM', name: 'ESP32 Development Board', category: 'Microcontrollers', price: '₹449', stock: 120, status: 'In Stock' },
    { _id: '2', sku: 'TC-ARD-UNO-R3', name: 'Arduino Uno R3 Compatible', category: 'Microcontrollers', price: '₹599', stock: 8, status: 'Low Stock' },
    { _id: '3', sku: 'TC-SNS-MPU6050', name: 'MPU-6050 6-DoF Gyroscope', category: 'Sensors', price: '₹189', stock: 0, status: 'Out of Stock' },
    { _id: '4', sku: 'TC-RASP-PI4-4G', name: 'Raspberry Pi 4 Model B (4GB)', category: 'Dev Boards', price: '₹5,899', stock: 45, status: 'In Stock' },
  ];

  const tableColumns = [
    { header: 'SKU Code', accessor: 'sku', sortable: true },
    { header: 'Item Name', accessor: 'name', sortable: true },
    { header: 'Category', accessor: 'category' },
    { header: 'Unit Price', accessor: 'price', align: 'right' },
    {
      header: 'Inventory Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Component Library & UI Kit"
        subtitle="Operational component primitives built to match the Tech Crate customer storefront design tokens"
        icon={Palette}
      />

      <Tabs
        tabs={[
          { id: 'buttons', label: 'Buttons & Badges' },
          { id: 'forms', label: 'Form Controls' },
          { id: 'cards', label: 'Cards & KPIs' },
          { id: 'data', label: 'Data Table & Dialogs' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* 1. Buttons & Badges */}
      {activeTab === 'buttons' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Button Variants & Sizes
            </h3>
            <div className="flex flex-wrap gap-3 items-center">
              <Button variant="primary" icon={Plus}>Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger" icon={Trash2}>Destructive Action</Button>
              <Button variant="primary" loading>Saving...</Button>
              <Button variant="primary" disabled>Disabled State</Button>
            </div>

            <div className="flex flex-wrap gap-3 items-center pt-2">
              <Button size="sm" variant="primary">Small (sm)</Button>
              <Button size="md" variant="primary">Medium (md)</Button>
              <Button size="lg" variant="primary">Large (lg)</Button>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Semantic Order & Inventory Status Badges
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <StatusBadge status="Placed" />
              <StatusBadge status="Confirmed" />
              <StatusBadge status="Packed" />
              <StatusBadge status="Shipped" />
              <StatusBadge status="Out for Delivery" />
              <StatusBadge status="Delivered" />
              <StatusBadge status="Cancelled" />
              <StatusBadge status="Returned" />
              <StatusBadge status="In Stock" />
              <StatusBadge status="Low Stock" />
              <StatusBadge status="Out of Stock" />
              <StatusBadge status="Pending" />
              <StatusBadge status="Approved" />
              <StatusBadge status="Rejected" />
            </div>
          </Card>
        </div>
      )}

      {/* 2. Form Controls */}
      {activeTab === 'forms' && (
        <Card className="p-6 space-y-5 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Standard Input Controls
          </h3>
          <Input
            label="Product Title"
            required
            placeholder="e.g. ESP32-WROOM-32D Development Board"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            helperText="Clear component name as shown to customers"
          />

          <Input
            label="Search Inventory"
            icon={Search}
            placeholder="Search by SKU or part number..."
          />

          <Input
            label="Invalid Field Demonstration"
            value="invalid-sku-#"
            error="SKU must contain only uppercase alphanumeric characters and hyphens"
          />

          <Select
            label="Hardware Category"
            options={['Microcontrollers', 'Sensors', 'Robotics & Motors', 'IoT & Wireless', 'Power & Batteries']}
          />

          <Textarea
            label="Technical Specifications"
            rows={3}
            placeholder="Operating Voltage, Pinout, Communication interfaces..."
          />

          <div className="pt-2 space-y-3">
            <Checkbox
              label="Pin headers pre-soldered on board"
              checked={checkboxVal}
              onChange={(e) => setCheckboxVal(e.target.checked)}
            />
            <Switch
              label="Publish immediately to customer catalog"
              checked={switchVal}
              onChange={setSwitchVal}
            />
          </div>
        </Card>
      )}

      {/* 3. Cards & KPIs */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value="₹2,48,900"
            change="+18.4%"
            trend="up"
            icon={DollarSign}
            accentColor="emerald"
            description="vs last 30 days"
          />
          <StatCard
            title="Active Orders"
            value="38"
            change="+12.1%"
            trend="up"
            icon={ShoppingCart}
            accentColor="blue"
            description="in fulfillment queue"
          />
          <StatCard
            title="Inventory Items"
            value="142"
            change="5 Low Stock"
            trend="neutral"
            icon={Package}
            accentColor="orange"
            description="SKUs in stock"
          />
          <StatCard
            title="Registered Makers"
            value="1,240"
            change="+48 this week"
            trend="up"
            icon={Users}
            accentColor="purple"
            description="customers & students"
          />
        </div>
      )}

      {/* 4. Data Table & Dialogs */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setModalOpen(true)}>Open Modal Dialog</Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>Open Confirm Dialog</Button>
          </div>

          <DataTable
            columns={tableColumns}
            data={sampleTableData}
            itemsPerPage={5}
          />

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Demonstration Operational Modal"
            description="Reusable accessible modal component with escape key and backdrop dismiss"
          >
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                This modal maintains strict focus trap, dark/light theme tokens, and scrolls smoothly on mobile devices.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
                <Button variant="primary" onClick={() => setModalOpen(false)}>Save Changes</Button>
              </div>
            </div>
          </Modal>

          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => setConfirmOpen(false)}
            title="Delete Selected Component?"
            message="Are you sure you wish to permanently delete this product? This action cannot be reversed."
            confirmText="Yes, Delete Item"
            danger
          />
        </div>
      )}
    </div>
  );
}
