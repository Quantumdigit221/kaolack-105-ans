import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import Navigation from "@/components/Navigation";
import EventBanner from "@/components/EventBanner";
import Kaolack105Slides from "@/components/Kaolack105Slides";
import Kaolack105Navigation from "@/components/Kaolack105Navigation";

interface Localite {
  id: number;
  nom: string;
}

const TYPE_DEMANDE_OPTIONS = [
  { label: "Attribution", value: "Attribution" },
  { label: "Régularisation", value: "Régularisation" },
  { label: "Authentification", value: "Authentification" },
];

const TYPE_TITRE_OPTIONS = [
  { label: "Permis d'occuper", value: "Permis d'occuper" },
  { label: "Bail communal", value: "Bail communal" },
  { label: "Proposition de bail", value: "Proposition de bail" },
  { label: "Transfert définitif", value: "Transfert définitif" },
];

const SITUATION_OPTIONS = [
    { value: "Célibataire", label: "Célibataire" },
    { value: "Marié(e)", label: "Marié(e)" },
    { value: "Veuf(ve)", label: "Veuf(ve)" },
    { value: "Divorcé(e)", label: "Divorcé(e)" },
  ];

  
const STATUT_LOGEMENT_OPTIONS = [
    { value: "Propriétaire", label: "Propriétaire" },
    { value: "Locataire", label: "Locataire" },
    { value: "Hébergé(e)", label: "Hébergé(e)" },
  ];

  
const DemandeTerrain = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localites, setLocalites] = useState<Localite[]>([]);
  const [loadingLocalites, setLoadingLocalites] = useState(true);

  // États du formulaire
  const [formData, setFormData] = useState({
    // Informations sur le terrain
    superficie: "",
    usagePrevu: "",
    localiteId: "",
    typeDemande: "",
    typeDocument: "",
    typeTitre: "",
    possedeAutreTerrain: "",
    terrainAilleurs: "",
    terrainAKaolack: "",

    // Informations du demandeur
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    profession: "",
    adresse: "",
    lieuNaissance: "",
    dateNaissance: "",
    numeroElecteur: "",
    nombreEnfant: "",
    situationMatrimoniale: "",
    situationDemandeur: "",
  });

  // Fichiers
  const [rectoFile, setRectoFile] = useState<File | null>(null);
  const [versoFile, setVersoFile] = useState<File | null>(null);
  const [rectoPreview, setRectoPreview] = useState<string | null>(null);
  const [versoPreview, setVersoPreview] = useState<string | null>(null);

  // Charger les localités
  useEffect(() => {
    const fetchLocalites = async () => {
      try {
        setLoadingLocalites(true);
        const response = await axios.get("https://backendgl.kaolackcommune.sn/api/localite/liste-web");
        console.log("response", response.data); 
        setLocalites(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des localités:", error);
        // Données de démo en cas d'erreur
        setLocalites([
          { id: 1, nom: "Centre-ville" },
          { id: 2, nom: "Medina Baye" },
          { id: 3, nom: "Ndorong" },
          { id: 4, nom: "Thiasky" },
          { id: 5, nom: "Keur Massar" },
        ]);
        toast.warning("Impossible de charger les localités. Utilisation de données par défaut.");
      } finally {
        setLoadingLocalites(false);
      }
    };

    fetchLocalites();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'recto' | 'verso') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Veuillez sélectionner un fichier PDF ou une image (JPG, PNG)");
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 10 MB");
      return;
    }

    if (type === 'recto') {
      setRectoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRectoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setVersoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVersoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type: 'recto' | 'verso') => {
    if (type === 'recto') {
      setRectoFile(null);
      setRectoPreview(null);
    } else {
      setVersoFile(null);
      setVersoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.typeDemande || !formData.localiteId) {
      toast.error("Veuillez remplir les champs obligatoires (Type de demande et Localité)");
      return;
    }

    if (!formData.email) {
      toast.error("L'email est requis");
      return;
    }

    if (!formData.prenom || !formData.nom) {
      toast.error("Veuillez renseigner votre prénom et nom");
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer FormData pour l'envoi (format attendu par le backend Symfony)
      const formDataToSend = new FormData();

      // Informations sur le terrain (champs requis)
      formDataToSend.append('localiteId', formData.localiteId);
      formDataToSend.append('typeDemande', formData.typeDemande);
      
      // Champs optionnels
      if (formData.superficie) {
        formDataToSend.append('superficie', formData.superficie);
      }
      if (formData.usagePrevu) {
        formDataToSend.append('usagePrevu', formData.usagePrevu);
      }
      if (formData.typeDocument) {
        formDataToSend.append('typeDocument', formData.typeDocument);
      }
      if (formData.typeTitre) {
        formDataToSend.append('typeTitre', formData.typeTitre);
      }
      // Les valeurs booléennes sont envoyées comme "true"/"false" (strings) - le backend les convertira
      if (formData.possedeAutreTerrain) {
        formDataToSend.append('possedeAutreTerrain', formData.possedeAutreTerrain);
      }
      if (formData.terrainAilleurs) {
        formDataToSend.append('terrainAilleurs', formData.terrainAilleurs);
      }
      if (formData.terrainAKaolack) {
        formDataToSend.append('terrainAKaolack', formData.terrainAKaolack);
      }

      // Informations du demandeur (champs requis)
      formDataToSend.append('email', formData.email);
      
      // Champs optionnels
      if (formData.prenom) {
        formDataToSend.append('prenom', formData.prenom);
      }
      if (formData.nom) {
        formDataToSend.append('nom', formData.nom);
      }
      if (formData.telephone) {
        formDataToSend.append('telephone', formData.telephone);
      }
      if (formData.profession) {
        formDataToSend.append('profession', formData.profession);
      }
      if (formData.adresse) {
        formDataToSend.append('adresse', formData.adresse);
      }
      if (formData.lieuNaissance) {
        formDataToSend.append('lieuNaissance', formData.lieuNaissance);
      }
      if (formData.dateNaissance) {
        formDataToSend.append('dateNaissance', formData.dateNaissance); // Format: yyyy-mm-dd
      }
      if (formData.numeroElecteur) {
        formDataToSend.append('numeroElecteur', formData.numeroElecteur);
      }
      if (formData.nombreEnfant) {
        formDataToSend.append('nombreEnfant', formData.nombreEnfant);
      }
      if (formData.situationMatrimoniale) {
        formDataToSend.append('situationMatrimoniale', formData.situationMatrimoniale);
      }
      if (formData.situationDemandeur) {
        formDataToSend.append('situationDemandeur', formData.situationDemandeur);
      }

      // Ajouter les fichiers (optionnels)
      if (rectoFile) {
        formDataToSend.append('recto', rectoFile);
      }
      if (versoFile) {
        formDataToSend.append('verso', versoFile);
      }

      // Log pour débogage (afficher les données envoyées)
      console.log("📤 Données envoyées au backend:");
      const formDataEntries = Array.from(formDataToSend.entries()).map(([key, value]) => [
        key,
        value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
      ]);
      console.log("FormData entries:", formDataEntries);

      // Envoyer la demande via axios
      // Note: Ne pas définir Content-Type manuellement pour FormData, axios le fait automatiquement
      const response = await axios.post(
        "https://backendgl.kaolackcommune.sn/api/demande/nouvelle-demande",
        formDataToSend
      );

      console.log("✅ Réponse du backend:", response.data);
      toast.success(response.data.message || "Votre demande a été créée avec succès !");
      
      // Réinitialiser le formulaire
      setFormData({
        superficie: "",
        usagePrevu: "",
        localiteId: "",
        typeDemande: "",
        typeDocument: "",
        typeTitre: "",
        possedeAutreTerrain: "",
        terrainAilleurs: "",
        terrainAKaolack: "",
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        profession: "",
        adresse: "",
        lieuNaissance: "",
        dateNaissance: "",
        numeroElecteur: "",
        nombreEnfant: "",
        situationMatrimoniale: "",
        situationDemandeur: "",
      });
      setRectoFile(null);
      setVersoFile(null);
      setRectoPreview(null);
      setVersoPreview(null);

      // Optionnel: rediriger vers une page de confirmation
      // navigate("/demande-terrain/confirmation");
    } catch (error: any) {
      console.error("❌ Erreur lors de la soumission:", error);
      console.error("❌ Détails de l'erreur:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Afficher le message d'erreur du serveur si disponible
      let errorMessage = "Une erreur est survenue lors de la soumission de votre demande";
      
      if (error.response?.data) {
        // Si le serveur retourne un message d'erreur
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8">
        <Kaolack105Slides />
      </div>
      <EventBanner
        href="/kaolack-105"
        dismissible={true}
      />
      <main className="bg-gradient-to-br from-kaolack-green/5 via-kaolack-gold/5 to-kaolack-orange/5 py-8 px-4">


        <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-kaolack-green via-kaolack-gold to-kaolack-orange bg-clip-text text-transparent">
              Demande d'Attribution de Terrain
            </CardTitle>
            <CardDescription>
              Veuillez remplir tous les champs obligatoires pour soumettre votre demande
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Informations sur le terrain */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-kaolack-green border-b pb-2">
                  1. Informations sur le terrain
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeDemande">
                      Type de demande <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.typeDemande}
                      onValueChange={(value) => handleSelectChange("typeDemande", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_DEMANDE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="localiteId">
                      Localité/Quartier <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.localiteId}
                      onValueChange={(value) => handleSelectChange("localiteId", value)}
                      disabled={loadingLocalites}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingLocalites ? "Chargement..." : "Sélectionnez une localité"} />
                      </SelectTrigger>
                      <SelectContent>
                        {localites.map((localite) => (
                          <SelectItem key={localite.id} value={localite.id.toString()}>
                            {localite.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="superficie">Superficie (m²)</Label>
                    <Input
                      id="superficie"
                      name="superficie"
                      type="number"
                      placeholder="Ex: 200"
                      value={formData.superficie}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usagePrevu">Usage prévu</Label>
                    <Input
                      id="usagePrevu"
                      name="usagePrevu"
                      type="text"
                      placeholder="Ex: Habitation, Commerce, etc."
                      value={formData.usagePrevu}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="typeDocument">Type de document</Label>
                    <Select
                      value={formData.typeDocument}
                      onValueChange={(value) => handleSelectChange("typeDocument", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cni">CNI</SelectItem>
                        <SelectItem value="passeport">Passeport</SelectItem>
                        <SelectItem value="carte-consulaire">Carte consulaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="typeTitre">Type de titre</Label>
                    <Select
                      value={formData.typeTitre}
                      onValueChange={(value) => handleSelectChange("typeTitre", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_TITRE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Possédez-vous un autre terrain ?</Label>
                  <RadioGroup
                    value={formData.possedeAutreTerrain}
                    onValueChange={(value) => handleSelectChange("possedeAutreTerrain", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="autre-terrain-oui" />
                      <Label htmlFor="autre-terrain-oui" className="font-normal cursor-pointer">
                        Oui
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="autre-terrain-non" />
                      <Label htmlFor="autre-terrain-non" className="font-normal cursor-pointer">
                        Non
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.possedeAutreTerrain === "true" && (
                  <div className="space-y-4">
                    <Label>Terrain ailleurs qu'à Kaolack ?</Label>
                    <RadioGroup
                      value={formData.terrainAilleurs}
                      onValueChange={(value) => handleSelectChange("terrainAilleurs", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="ailleurs-oui" />
                        <Label htmlFor="ailleurs-oui" className="font-normal cursor-pointer">
                          Oui
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="ailleurs-non" />
                        <Label htmlFor="ailleurs-non" className="font-normal cursor-pointer">
                          Non
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <div className="space-y-4">
                  <Label>Terrain à Kaolack ?</Label>
                  <RadioGroup
                    value={formData.terrainAKaolack}
                    onValueChange={(value) => handleSelectChange("terrainAKaolack", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="kaolack-oui" />
                      <Label htmlFor="kaolack-oui" className="font-normal cursor-pointer">
                        Oui
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="kaolack-non" />
                      <Label htmlFor="kaolack-non" className="font-normal cursor-pointer">
                        Non
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Section 2: Informations du demandeur */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-kaolack-green border-b pb-2">
                  2. Informations du demandeur
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">
                      Prénom <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="prenom"
                      name="prenom"
                      type="text"
                      placeholder="Votre prénom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nom">
                      Nom <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nom"
                      name="nom"
                      type="text"
                      placeholder="Votre nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      placeholder="+221 XX XXX XX XX"
                      value={formData.telephone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      name="profession"
                      type="text"
                      placeholder="Votre profession"
                      value={formData.profession}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      name="adresse"
                      type="text"
                      placeholder="Votre adresse complète"
                      value={formData.adresse}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lieuNaissance">Lieu de naissance</Label>
                    <Input
                      id="lieuNaissance"
                      name="lieuNaissance"
                      type="text"
                      placeholder="Ville de naissance"
                      value={formData.lieuNaissance}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateNaissance">Date de naissance</Label>
                    <Input
                      id="dateNaissance"
                      name="dateNaissance"
                      type="date"
                      value={formData.dateNaissance}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroElecteur">Numéro d'électeur</Label>
                    <Input
                      id="numeroElecteur"
                      name="numeroElecteur"
                      type="text"
                      placeholder="Numéro d'électeur"
                      value={formData.numeroElecteur}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombreEnfant">Nombre d'enfants</Label>
                    <Input
                      id="nombreEnfant"
                      name="nombreEnfant"
                      type="number"
                      placeholder="0"
                      value={formData.nombreEnfant}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="situationMatrimoniale">Situation matrimoniale</Label>
                    <Select
                      value={formData.situationMatrimoniale}
                      onValueChange={(value) => handleSelectChange("situationMatrimoniale", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        {SITUATION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="situationDemandeur">Situation du demandeur</Label>
                    <Select
                      value={formData.situationDemandeur}
                      onValueChange={(value) => handleSelectChange("situationDemandeur", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Propriétaire">Propriétaire</SelectItem>
                        <SelectItem value="Locataire">Locataire</SelectItem>
                        <SelectItem value="Hébergé(e)">Hébergé(e)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 3: Documents à joindre */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-kaolack-green border-b pb-2">
                  3. Documents à joindre
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recto">Recto du document d'identité</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="recto"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'recto')}
                        className="cursor-pointer"
                      />
                    </div>
                    {rectoPreview && (
                      <div className="mt-2 relative">
                        {rectoFile?.type.startsWith('image/') ? (
                          <img
                            src={rectoPreview}
                            alt="Aperçu recto"
                            className="w-full h-32 object-cover rounded border"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-4 border rounded bg-muted">
                            <FileText className="h-8 w-8" />
                            <span className="text-sm">{rectoFile?.name}</span>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeFile('recto')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Formats acceptés: PDF, JPG, PNG (max 10MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verso">Verso du document d'identité</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="verso"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'verso')}
                        className="cursor-pointer"
                      />
                    </div>
                    {versoPreview && (
                      <div className="mt-2 relative">
                        {versoFile?.type.startsWith('image/') ? (
                          <img
                            src={versoPreview}
                            alt="Aperçu verso"
                            className="w-full h-32 object-cover rounded border"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-4 border rounded bg-muted">
                            <FileText className="h-8 w-8" />
                            <span className="text-sm">{versoFile?.name}</span>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeFile('verso')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Formats acceptés: PDF, JPG, PNG (max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons de soumission */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gradient-kaolack"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Soumettre la demande
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
};

export default DemandeTerrain;

