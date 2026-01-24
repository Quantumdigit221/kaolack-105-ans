import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Music, BookOpen, Landmark, Calendar, Users, Star, Clock, MapPin, Heart, Share2, ChevronRight, Award, Palette, Theater, Building, Church } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Logo105 from "@/components/Logo105";
import { axesInterventionService } from "@/services/axesInterventionService";
import '../styles/mobile-fixes.css';

const CulturePatrimoine = () => {
  const [activeTab, setActiveTab] = useState("patrimoine");
  const [axeData, setAxeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAxeData();
  }, []);

  const loadAxeData = async () => {
    try {
      const data = await axesInterventionService.getAxeData('culture');
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const sitesPatrimoniaux = axeData?.sitesPatrimoniaux || [];
  const evenementsCulturels = axeData?.evenementsCulturels || [];
  const initiativesCulturelles = axeData?.initiativesCulturels || [];

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "protégé": return "bg-green-100 text-green-800";
      case "en_renovation": return "bg-yellow-100 text-yellow-800";
      case "musee": return "bg-purple-100 text-purple-800";
      case "confirmé": return "bg-blue-100 text-blue-800";
      case "en_vente": return "bg-orange-100 text-orange-800";
      case "bientot": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatutText = (statut: string) => {
    switch (statut) {
      case "protégé": return "Protégé";
      case "en_renovation": return "En rénovation";
      case "musee": return "Musée";
      case "confirmé": return "Confirmé";
      case "en_vente": return "Billets en vente";
      case "bientot": return "Bientôt";
      default: return "Inconnu";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-pink-700 to-rose-800 text-white overflow-hidden">
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
                <Building className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                  Culture & Patrimoine
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  Célébrer notre histoire et notre créativité
                </p>
              </div>
            </div>
            
            <p className="text-lg text-white/80 leading-relaxed max-w-3xl">
              Kaolack regorge d'un riche patrimoine culturel et historique. Découvrez nos sites 
              emblématiques, nos événements culturels et les artistes qui font vivre notre culture.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation par onglets */}
      <section className="sticky top-16 z-40 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: "patrimoine", label: "Patrimoine", icon: <Landmark className="h-4 w-4" /> },
              { id: "evenements", label: "Événements", icon: <Calendar className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-purple-600 text-purple-600 bg-purple-50"
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
        {/* Onglet Patrimoine */}
        {activeTab === "patrimoine" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Sites Patrimoniaux
              </h2>
              <p className="text-gray-600">
                Explorez les trésors historiques et culturels de Kaolack
              </p>
            </div>

            <div className="space-y-8">
              {sitesPatrimoniaux.length > 0 ? (
                sitesPatrimoniaux.map((site, index) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                    <div className="md:flex">
                      <div className={`md:w-1/3 bg-gradient-to-br ${site.color} p-6 text-white`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(site.statut)} text-gray-900`}>
                            {getStatutText(site.statut)}
                          </span>
                          <div className="p-2 bg-white/20 rounded-lg">
                            {site.icon}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3">{site.nom}</h3>
                        <p className="text-white/90 text-sm mb-4">{site.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/80">Période:</span>
                            <span className="font-medium">{site.periode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/80">Visiteurs:</span>
                            <span className="font-medium">{site.visiteurs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/80">Catégorie:</span>
                            <span className="font-medium">{site.categorie}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-2/3 p-6">
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Star className="h-5 w-5 text-purple-600 mr-2" />
                            Caractéristiques
                          </h4>
                          <ul className="space-y-2">
                            {site.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start">
                                <ChevronRight className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Clock className="h-4 w-4 text-purple-600 mr-2" />
                              Horaires
                            </h5>
                            <p className="text-gray-600 text-sm">{site.horaires}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <MapPin className="h-4 w-4 text-purple-600 mr-2" />
                              Accès
                            </h5>
                            <p className="text-gray-600 text-sm">{site.acces}</p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Calendar className="h-4 w-4 text-purple-600 mr-2" />
                            Événements à venir
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {site.evenements.map((event, idx) => (
                              <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                {event}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            <Camera className="h-4 w-4 mr-2" />
                            Visiter
                          </Button>
                          <Button variant="outline">
                            <Share2 className="h-4 w-4 mr-2" />
                            Partager
                          </Button>
                          <Button variant="outline">
                            <Heart className="h-4 w-4 mr-2" />
                            Favoris
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Aucun site patrimonial référencé pour le moment.</p>
                  <p className="text-gray-400 text-sm mt-2">Découvrez bientôt nos trésors historiques et culturels.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Onglet Événements */}
        {activeTab === "evenements" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Événements Culturels
              </h2>
              <p className="text-gray-600">
                Ne manquez pas les prochains événements culturels de Kaolack
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {evenementsCulturels.length > 0 ? (
                evenementsCulturels.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer w-full">
                    <div className={`h-32 sm:h-48 bg-gradient-to-br ${event.color} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                        <span className={`px-2 sm:px-3 py-1 bg-white/90 text-gray-900 rounded-full text-xs font-medium`}>
                          {getStatutText(event.statut)}
                        </span>
                      </div>
                      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                        <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm inline-block">
                          <div className="w-4 h-4 sm:w-6 sm:h-6">
                            {event.icon}
                          </div>
                        </div>
                        <p className="text-white font-medium mt-1 sm:mt-2 text-xs sm:text-sm">{event.date}</p>
                        <p className="text-white/90 text-xs sm:text-sm">{event.lieu}</p>
                      </div>
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors text-sm sm:text-base">
                        {event.titre}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="mb-4">
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          <span>{event.participants} participants attendus</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">Programme</h5>
                        <ul className="space-y-1">
                          {event.programme.slice(0, 2).map((item, idx) => (
                            <li key={idx} className="text-xs sm:text-sm text-gray-600 flex items-center">
                              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 mr-2" />
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">Tarifs</h5>
                        <div className="space-y-1">
                          {Object.entries(event.tarifs).slice(0, 2).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                              <span className="font-medium text-purple-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm py-2">
                          Réserver
                        </Button>
                        <Button variant="outline" size="sm" className="p-2">
                          <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">Aucun événement culturel prévu pour le moment.</p>
                  <p className="text-gray-400 text-sm mt-2">Revenez bientôt pour découvrir nos prochaines animations.</p>
                </div>
              )}
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
                <Building className="h-8 w-8" />
                <span className="font-bold text-lg">Culture</span>
              </div>
              <p className="text-gray-400">
                Célébrons ensemble notre riche patrimoine culturel
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Découvrir</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Sites patrimoniaux</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Événements</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tél: +221 33 941 12 36</li>
                <li>Email: culture@kaolack.sn</li>
                <li>Horaire: Lun-Ven 8h-17h</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">
                Recevez les actualités culturelles
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                S'abonner
              </Button>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Mairie de Kaolack - Direction Culture & Patrimoine</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CulturePatrimoine;
