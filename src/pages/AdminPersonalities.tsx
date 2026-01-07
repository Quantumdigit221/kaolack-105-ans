import React from 'react';
import PersonalitiesManagement from '@/components/admin/PersonalitiesManagement';

const AdminPersonalitiesPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Approbation des Personnalités</h2>
      <PersonalitiesManagement />
    </div>
  );
};

export default AdminPersonalitiesPage;
