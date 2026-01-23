import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Home, MapPin, Wrench, Truck, Trees, Zap, Shield, Clock, TrendingUp, Users, FileText, ChevronRight, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Logo105 from "@/components/Logo105";
import { axesInterventionService } from "@/services/axesInterventionService";
import '../styles/mobile-fixes.css';

const UrbanismeInfrastructure = () => {
  const [activeTab, setActiveTab] = useState("projets");
  const [axeData, setAxeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAxeData();
  }, []);

  const loadAxeData = async () => {
    try {
      const data = await axesInterventionService.getAxeData('urbanisme');
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const projets = axeData?.projets || [];
  const services = axeData?.services || [];
  const actualites = axeData?.actualites || [];

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "en_cours": return "bg-blue-100 text-blue-800";
      case "planifie": return "bg-yellow-100 text-yellow-800";
      case "termine": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatutText = (statut: string) => {
    switch (statut) {
      case "en_cours": return "En cours";
      case "planifie": return "Planifié";
      case "termine": return "Terminé";
      default: return "Inconnu";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
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
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                  Urbanisme & Infrastructure
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  Construire la Kaolack de demain
                </p>
              </div>
            </div>
            
            <p className="text-lg text-white/80 leading-relaxed max-w-3xl">
              Nous œuvrons pour moderniser les infrastructures urbaines, améliorer la qualité de vie 
              des citoyens et créer un environnement propice au développement économique durable.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation par onglets */}
      <section className="sticky top-16 z-40 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: "projets", label: "Projets", icon: <Building2 className="h-4 w-4" /> },
              { id: "services", label: "Services", icon: <Wrench className="h-4 w-4" /> },
              { id: "actualites", label: "Actualités", icon: <FileText className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
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
        {/* Onglet Projets */}
        {activeTab === "projets" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Projets en cours
              </h2>
              <p className="text-gray-600">
                Découvrez les grands projets de transformation urbaine de Kaolack
              </p>
            </div>

            <div className="space-y-8">
              {projets.map((projet, index) => (
                <motion.div
                  key={projet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                    <div className="md:flex">
                      <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(projet.statut)} text-gray-900`}>
                            {getStatutText(projet.statut)}
                          </span>
                          <Building2 className="h-8 w-8 opacity-50" />
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3">{projet.titre}</h3>
                        <p className="text-blue-100 text-sm mb-4">{projet.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-200">Budget:</span>
                            <span className="font-medium">{projet.budget}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-200">Délai:</span>
                            <span className="font-medium">{projet.delai}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progression</span>
                            <span>{projet.progression}%</span>
                          </div>
                          <div className="w-full bg-blue-800 rounded-full h-2">
                            <div 
                              className="bg-white rounded-full h-2 transition-all duration-500"
                              style={{ width: `${projet.progression}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-2/3 p-6">
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            Détails du projet
                          </h4>
                          <ul className="space-y-2">
                            {projet.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start">
                                <ChevronRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Users className="h-5 w-5 text-blue-600 mr-2" />
                            Bénéfices pour la communauté
                          </h4>
                          <ul className="space-y-2">
                            {projet.benefices.map((benefice, idx) => (
                              <li key={idx} className="flex items-start">
                                <TrendingUp className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{benefice}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            En savoir plus
                          </Button>
                          <Button variant="outline">
                            Suivre le projet
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

        {/* Onglet Services */}
        {activeTab === "services" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Services d'Urbanisme
              </h2>
              <p className="text-gray-600">
                Accédez aux services administratifs pour vos projets d'urbanisme
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto p-3 bg-blue-100 rounded-2xl text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {service.icon}
                      </div>
                      <CardTitle className="text-xl">{service.titre}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Délai: </span>
                          <span className="font-medium text-gray-900 ml-1">{service.delai}</span>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Documents requis:</h5>
                          <ul className="space-y-1">
                            {service.documents.map((doc, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center">
                                <FileText className="h-3 w-3 text-gray-400 mr-2" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Faire une demande
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section d'aide */}
            <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h4>
                    <p className="text-gray-600 mb-4">
                      Notre équipe d'urbanistes est à votre disposition pour vous accompagner 
                      dans vos projets. Contactez-nous pour un conseil personnalisé.
                    </p>
                    <div className="flex gap-3">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <MapPin className="h-4 w-4 mr-2" />
                        Nous rendre visite
                      </Button>
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Télécharger les formulaires
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Onglet Actualités */}
        {activeTab === "actualites" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Actualités & Événements
              </h2>
              <p className="text-gray-600">
                Restez informé des dernières nouvelles et des événements à venir
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actualites.map((actualite, index) => (
                <motion.div
                  key={actualite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer">
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 text-blue-900 rounded-full text-xs font-medium">
                          {actualite.categorie.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white/90 text-sm">{actualite.date}</p>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {actualite.titre}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {actualite.description}
                      </p>
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                        Lire la suite
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
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
                <Building2 className="h-8 w-8" />
                <span className="font-bold text-lg">Urbanisme</span>
              </div>
              <p className="text-gray-400">
                Construisons ensemble la Kaolack de demain
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Permis de construire</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Lotissement</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contrôles</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tél: +221 33 941 12 34</li>
                <li>Email: urbanisme@kaolack.sn</li>
                <li>Horaire: Lun-Ven 8h-17h</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">
                Recevez les actualités des projets d'urbanisme
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                S'abonner
              </Button>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Mairie de Kaolack - Direction Urbanisme & Infrastructure</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UrbanismeInfrastructure;
