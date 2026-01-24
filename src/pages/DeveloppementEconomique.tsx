import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Briefcase, DollarSign, Users, Building2, ShoppingCart, Factory, Lightbulb, Award, Target, Globe, ChevronRight, CheckCircle, BarChart3, PieChart, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Logo105 from "@/components/Logo105";
import { axesInterventionService } from "@/services/axesInterventionService";
import '../styles/mobile-fixes.css';

const DeveloppementEconomique = () => {
  const [activeTab, setActiveTab] = useState("initiatives");
  const [axeData, setAxeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAxeData();
  }, []);

  const loadAxeData = async () => {
    try {
      const data = await axesInterventionService.getAxeData('economie');
      setAxeData(data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const initiatives = axeData?.initiatives || [];
  const statistiques = axeData?.statistiques || [];
  const secteurs = axeData?.secteurs || [];
  const opportunites = axeData?.opportunites || [];

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "actif": return "bg-green-100 text-green-800";
      case "en_cours": return "bg-blue-100 text-blue-800";
      case "lancement": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatutText = (statut: string) => {
    switch (statut) {
      case "actif": return "Actif";
      case "en_cours": return "En cours";
      case "lancement": return "Lancement";
      default: return "Inconnu";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-4xl">
            <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                  Développement Économique
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  Stimuler la croissance et créer des opportunités
                </p>
              </div>
            </div>
            
            <p className="text-lg text-white/80 leading-relaxed max-w-3xl">
              Nous soutenons l'entrepreneuriat, attirons les investissements et créons un environnement 
              favorable au développement économique durable pour tous les citoyens de Kaolack.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation par onglets */}
      <section className="sticky top-16 z-40 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: "initiatives", label: "Initiatives", icon: <Target className="h-4 w-4" /> },
              { id: "statistiques", label: "Statistiques", icon: <BarChart3 className="h-4 w-4" /> },
              { id: "secteurs", label: "Secteurs", icon: <PieChart className="h-4 w-4" /> },
              { id: "opportunites", label: "Opportunités", icon: <Award className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-emerald-600 text-emerald-600 bg-emerald-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Onglet Initiatives */}
        {activeTab === "initiatives" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Initiatives Économiques
              </h2>
              <p className="text-gray-600">
                Découvrez nos programmes pour soutenir l'économie locale
              </p>
            </div>

            <div className="space-y-8">
              {initiatives.map((initiative, index) => (
                <motion.div
                  key={initiative.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                    <div className="md:flex">
                      <div className={`md:w-1/3 bg-gradient-to-br ${initiative.color} p-6 text-white`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(initiative.statut)} text-gray-900`}>
                            {getStatutText(initiative.statut)}
                          </span>
                          <div className="p-2 bg-white/20 rounded-lg">
                            {initiative.icon}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3">{initiative.titre}</h3>
                        <p className="text-white/90 text-sm mb-4">{initiative.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/80">Budget:</span>
                            <span className="font-medium">{initiative.budget}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/80">Bénéficiaires:</span>
                            <span className="font-medium">{initiative.beneficiaires}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/80">Secteur:</span>
                            <span className="font-medium">{initiative.secteur}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progression</span>
                            <span>{initiative.progression}%</span>
                          </div>
                          <div className="w-full bg-white/30 rounded-full h-2">
                            <div 
                              className="bg-white rounded-full h-2 transition-all duration-500"
                              style={{ width: `${initiative.progression}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-2/3 p-6">
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            Actions menées
                          </h4>
                          <ul className="space-y-2">
                            {initiative.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start">
                                <ChevronRight className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Award className="h-5 w-5 text-emerald-600 mr-2" />
                            Résultats obtenus
                          </h4>
                          <ul className="space-y-2">
                            {initiative.resultats.map((resultat, idx) => (
                              <li key={idx} className="flex items-start">
                                <Target className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{resultat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button className="bg-emerald-600 hover:bg-emerald-700">
                            Postuler
                          </Button>
                          <Button variant="outline">
                            En savoir plus
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Onglet Statistiques */}
        {activeTab === "statistiques" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Indicateurs Économiques
              </h2>
              <p className="text-gray-600">
                Les chiffres clés de l'économie de Kaolack
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {statistiques.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div className={`mx-auto p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-100 ${stat.color} mb-3 sm:mb-4`}>
                        <div className="w-6 h-6 sm:w-8 sm:h-8">
                          {stat.icon}
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{stat.valeur}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                      <span className="text-gray-400 ml-1">vs {stat.periode}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Graphique de tendance */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Évolution économique</h3>
              <div className="h-64 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                  <p className="text-gray-600">Graphique interactif en développement</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Onglet Secteurs */}
        {activeTab === "secteurs" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Secteurs Porteurs
              </h2>
              <p className="text-gray-600">
                Les principaux secteurs qui dynamisent l'économie locale
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {secteurs.map((secteur, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${secteur.color}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${secteur.color} text-white`}>
                          {secteur.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {secteur.nom}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Poids dans l'économie</p>
                              <p className="text-lg font-bold text-gray-900">{secteur.poids}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Croissance</p>
                              <p className="text-lg font-bold text-green-600">{secteur.croissance}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Entreprises</p>
                              <p className="text-lg font-bold text-gray-900">{secteur.entreprises}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Emplois</p>
                              <p className="text-lg font-bold text-gray-900">{secteur.emplois}</p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full">
                            Explorer les opportunités
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Onglet Opportunités */}
        {activeTab === "opportunites" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Opportunités d'Affaires
              </h2>
              <p className="text-gray-600">
                Découvrez les opportunités pour développer votre entreprise
              </p>
            </div>

            <div className="space-y-6">
              {opportunites.map((opportunite, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                          <Award className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {opportunite.titre}
                            </h3>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                              {opportunite.type}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">{opportunite.description}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Date limite</p>
                              <p className="font-medium text-gray-900">{opportunite.deadline}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Montant</p>
                              <p className="font-medium text-emerald-600">{opportunite.montant}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                              Postuler maintenant
                            </Button>
                            <Button variant="outline">
                              <FileText className="h-4 w-4 mr-2" />
                              Télécharger les conditions
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-8 w-8" />
                <span className="font-bold text-lg">Économie</span>
              </div>
              <p className="text-gray-400">
                Ensemble pour une économie prospère et inclusive
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Appui PME</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Financement</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Formation</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tél: +221 33 941 12 35</li>
                <li>Email: economie@kaolack.sn</li>
                <li>Horaire: Lun-Ven 8h-17h</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">
                Recevez les opportunités économiques
              </p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                S'abonner
              </Button>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Mairie de Kaolack - Direction Développement Économique</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DeveloppementEconomique;
