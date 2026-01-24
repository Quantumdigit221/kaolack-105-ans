import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Users, FileText, Shield, Heart, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { axesInterventionService } from "@/services/axesInterventionService";
import '../styles/mobile-fixes.css';

const ServicesCitoyens = () => {
  const [servicesData, setServicesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServicesData();
  }, []);

  const loadServicesData = async () => {
    try {
      const data = await axesInterventionService.getAxeData('services');
      setServicesData(data);
    } catch (error) {
      console.error('Erreur lors du chargement des données des services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  // Utiliser les données dynamiques depuis l'API
  const services = servicesData?.services || [];
  const urgences = servicesData?.urgences || [];

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
                  Services Municipaux
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  Au service de tous les citoyens
                </p>
              </div>
            </div>
            
            <p className="text-lg text-white/80 leading-relaxed max-w-3xl">
              La Mairie de Kaolack met à votre disposition un large éventail de services 
              pour répondre à vos besoins quotidiens. Découvrez nos services administratifs, 
              sociaux, techniques et bien plus encore.
            </p>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Services */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Nos Services Municipaux
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.length > 0 ? (
              services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md group w-full">
                  <CardHeader className="text-center pb-4 px-4 sm:px-6">
                    <div className={`mx-auto p-3 sm:p-4 bg-gradient-to-br ${service.color} rounded-xl sm:rounded-2xl text-white mb-3 sm:mb-4 transition-transform`}>
                      <div className="w-6 h-6 sm:w-8 sm:h-8">
                        {service.icon}
                      </div>
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{service.titre}</CardTitle>
                    <CardDescription className="text-gray-600 text-sm sm:text-base">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 sm:px-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Services proposés</h5>
                        <ul className="space-y-1">
                          {service.services.map((item, idx) => (
                            <li key={idx} className="text-xs sm:text-sm text-gray-600 flex items-start">
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="leading-tight">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <p><strong>Horaires:</strong> {service.horaires}</p>
                        <p><strong>Contact:</strong> {service.contact}</p>
                      </div>
                      
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-sm sm:text-base py-2 sm:py-2.5">
                        Contacter le service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">Aucun service disponible pour le moment.</p>
                <p className="text-gray-400 text-sm mt-2">Veuillez revenir plus tard.</p>
              </div>
            )}
          </div>
        </div>

        {/* Urgences */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Numéros d'Urgence
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {urgences.length > 0 ? (
              urgences.map((urgence, index) => (
                <div key={index} className="bg-white rounded-lg p-4 sm:p-6 border border-red-200 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg text-red-600">
                      <div className="w-4 h-4 sm:w-6 sm:h-6">
                        {urgence.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{urgence.service}</h4>
                      <p className="text-lg sm:text-2xl font-bold text-red-600">{urgence.numero}</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">{urgence.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Disponible 24h/24</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Aucun numéro d'urgence disponible.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServicesCitoyens;
