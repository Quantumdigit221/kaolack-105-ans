import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Personality {
  id: number | string;
  name: string;
  category: string;
  role: string;
  description: string;
  image: string;
  contributions: string[];
  votes: number;
  status: 'pending' | 'approved';
  isProposal?: boolean;
  proposedBy?: string;
}

const PersonalitiesManagement = () => {
  const [proposals, setProposals] = useState<Personality[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('personality_proposals');
    if (saved) {
      try {
        setProposals(JSON.parse(saved));
      } catch (err) {
        setProposals([]);
      }
    }
  }, []);

  const approvePersonality = (id: number | string) => {
    const updated = proposals.map(p =>
      p.id === id ? { ...p, status: 'approved' } : p
    );
    setProposals(updated);
    localStorage.setItem('personality_proposals', JSON.stringify(updated));
    toast.success('Personnalité approuvée !');
  };

  const pending = proposals.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Approbation des Personnalités ({pending.length})</h3>
      <div className="space-y-4">
        {pending.map(person => (
          <Card key={person.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>{person.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">{person.role} - {person.category}</div>
              <div className="mb-2 text-gray-600">{person.description}</div>
              <Button onClick={() => approvePersonality(person.id)}>
                Approuver
              </Button>
            </CardContent>
          </Card>
        ))}
        {pending.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune personnalité à approuver
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalitiesManagement;
