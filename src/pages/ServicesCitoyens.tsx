import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, FileText, Shield, Heart, Baby, GraduationCap, Home, Car, Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle, HelpCircle, Calendar, CreditCard, UserCheck, Building, Zap, ChevronRight, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Logo105 from "@/components/Logo105";
import { axesInterventionService } from "@/services/axesInterventionService";
import '../styles/mobile-fixes.css';

const ServicesCitoyens = () => {
  const [activeTab, setActiveTab] = useState("administratifs");
  const [axeData, setAxeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAxeData();
  }, []);

  const loadAxeData = async () => {
    try {
      const data = await axesInterventionService.getAxeData('services');
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const servicesAdministratifs = axeData?.servicesAdministratifs || [];
  const servicesSociaux = axeData?.servicesSociaux || [];
  const servicesTechniques = axeData?.servicesTechniques || [];
  const demarchesEnLigne = axeData?.demarchesEnLigne || [];

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "en_cours":
        return "bg-yellow-200";
      case "termine":
        return "bg-green-200";
      case "en_attente":
        return "bg-gray-200";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-800 text-white overflow-hidden">
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
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                  Services aux Citoyens
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  Tous les services municipaux à votre portée
                </p>
              </div>
            </div>
            
            <p className="text-lg text-white/80 leading-relaxed max-w-3xl">
              Accédez facilement à l'ensemble des services municipaux : administratifs, sociaux, 
              techniques et bien plus encore. Simplifions vos démarches au quotidien.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation par onglets */}
      <section className="sticky top-16 z-40 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: "administratifs", label: "Services Administratifs", icon: <FileText className="h-4 w-4" /> },
              { id: "sociaux", label: "Services Sociaux", icon: <Heart className="h-4 w-4" /> },
              { id: "techniques", label: "Services Techniques", icon: <Zap className="h-4 w-4" /> },
              { id: "enligne", label: "Démarches en Ligne", icon: <CreditCard className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-teal-600 text-teal-600 bg-teal-50"
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
        {/* Onglet Services Administratifs */}
        {activeTab === "administratifs" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Services Administratifs
              </h2>
              <p className="text-gray-600">
                Accédez aux services administratifs essentiels pour vos démarches
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesAdministratifs.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group">
                    <CardHeader className="text-center pb-4">
                      <div className={`mx-auto p-3 bg-gradient-to-br ${service.color} rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform`}>
                        {service.icon}
                      </div>
                      <CardTitle className="text-xl">{service.titre}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Délai</p>
                            <p className="font-medium text-gray-900">{service.delai}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Coût</p>
                            <p className="font-medium text-gray-900">{service.cout}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Documents requis</h5>
                          <ul className="space-y-1">
                            {service.documents.map((doc, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center">
                                <CheckCircle className="h-3 w-3 text-teal-600 mr-2" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Procédure</h5>
                          <ul className="space-y-1">
                            {service.procedures.slice(0, 2).map((proc, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start">
                                <ChevronRight className="h-3 w-3 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                                {proc}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <p><strong>Contact:</strong> {service.contact}</p>
                          <p><strong>Horaires:</strong> {service.horaires}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {service.enLigne && (
                            <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
                              Faire la demande en ligne
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
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

        {/* Onglet Services Sociaux */}
        {activeTab === "sociaux" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Services Sociaux
              </h2>
              <p className="text-gray-600">
                Soutien et accompagnement pour les situations sociales
              </p>
            </div>

            <div className="space-y-6">
              {servicesSociaux.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-gradient-to-br ${service.color} rounded-xl text-white`}>
                          {service.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {service.titre}
                          </h3>
                          <p className="text-gray-600 mb-4">{service.description}</p>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Bénéficiaires</p>
                              <p className="font-medium text-gray-900">{service.beneficiaires}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Délai de traitement</p>
                              <p className="font-medium text-gray-900">{service.delai}</p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Conditions d'éligibilité</h5>
                            <ul className="space-y-1">
                              {service.conditions.map((condition, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <CheckCircle className="h-3 w-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                  {condition}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Aides proposées</h5>
                            <div className="flex flex-wrap gap-2">
                              {service.aides.map((aide, idx) => (
                                <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">
                                  {aide}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            {service.rdv && (
                              <Button className="bg-teal-600 hover:bg-teal-700">
                                <Calendar className="h-4 w-4 mr-2" />
                                Prendre rendez-vous
                              </Button>
                            )}
                            <Button variant="outline">
                              <Phone className="h-4 w-4 mr-2" />
                              {service.contact}
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

        {/* Onglet Services Techniques */}
        {activeTab === "techniques" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Services Techniques
              </h2>
              <p className="text-gray-600">
                Gestion des infrastructures et services techniques de la ville
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesTechniques.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                    <CardHeader className="text-center pb-4">
                      <div className={`mx-auto p-3 bg-gradient-to-br ${service.color} rounded-2xl text-white mb-4`}>
                        {service.icon}
                      </div>
                      <CardTitle className="text-xl">{service.titre}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Services proposés</h5>
                          <ul className="space-y-1">
                            {service.services.map((serv, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center">
                                <CheckCircle className="h-3 w-3 text-teal-600 mr-2" />
                                {serv}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Délais et coûts</h5>
                          <div className="space-y-1">
                            {Object.entries(service.delai).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-600 capitalize">{key}:</span>
                                <span className="font-medium text-gray-900">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <p><strong>Contact:</strong> {service.contact}</p>
                          {service.urgence && (
                            <p className="text-red-600 font-medium">
                              <AlertCircle className="h-3 w-3 inline mr-1" />
                              Service d'urgence disponible
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
                            <Phone className="h-4 w-4 mr-2" />
                            Contacter
                          </Button>
                          {service.urgence && (
                            <Button variant="destructive" size="sm">
                              Urgence
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Onglet Démarches en Ligne */}
        {activeTab === "enligne" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Démarches en Ligne
              </h2>
              <p className="text-gray-600">
                Simplifiez vos démarches avec nos services en ligne
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {demarchesEnLigne.map((demarche, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className={`mx-auto p-3 rounded-xl mb-4 ${
                        demarche.disponible 
                          ? "bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors" 
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {demarche.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{demarche.titre}</h3>
                      <p className="text-sm text-gray-600 mb-4">{demarche.description}</p>
                      <Button 
                        className={`w-full ${
                          demarche.disponible 
                            ? "bg-teal-600 hover:bg-teal-700" 
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                        disabled={!demarche.disponible}
                      >
                        {demarche.disponible ? (
                          <>
                            Accéder
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          "Bientôt disponible"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section Urgences */}
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                  Numéros d'Urgence
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {urgences.map((urgence, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                          {urgence.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{urgence.service}</h4>
                          <p className="text-2xl font-bold text-red-600">{urgence.numero}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{urgence.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{urgence.disponible}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-8 w-8" />
                <span className="font-bold text-lg">Services</span>
              </div>
              <p className="text-gray-400">
                Au service des citoyens de Kaolack
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">État civil</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Urbanisme</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Services sociaux</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tél: +221 33 941 12 39</li>
                <li>Email: services@kaolack.sn</li>
                <li>Horaire: Lun-Ven 8h-17h</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Assistance</h4>
              <p className="text-gray-400 mb-4">
                Besoin d'aide pour vos démarches ?
              </p>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                <HelpCircle className="h-4 w-4 mr-2" />
                Contacter l'assistance
              </Button>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Mairie de Kaolack - Direction Services aux Citoyens</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServicesCitoyens;
