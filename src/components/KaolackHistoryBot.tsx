import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, X, Minimize2, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiService } from '@/services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Base de connaissances sur l'histoire de Kaolack
const knowledgeBase: { keywords: string[]; response: string }[] = [
  {
    keywords: ['fondation', 'créé', 'création', 'naissance', 'origine', 'commencement'],
    response: "Kaolack a été fondée en 1920. La ville est née de la fusion de plusieurs villages et a rapidement développé une identité forte grâce à sa position stratégique sur le fleuve Saloum et son rôle commercial important."
  },
  {
    keywords: ['1920', 'année', 'date'],
    response: "1920 est l'année de fondation de Kaolack. Cette année marque le début officiel de la commune qui célèbre aujourd'hui 105 ans d'histoire riche et dynamique."
  },
  {
    keywords: ['géographie', 'localisation', 'position', 'situé', 'où', 'lieu'],
    response: "Kaolack est située dans le centre-ouest du Sénégal, sur la rive gauche du fleuve Saloum. La ville est la capitale de la région de Kaolack et occupe une position stratégique pour le commerce et les échanges."
  },
  {
    keywords: ['économie', 'commerce', 'marché', 'activité économique', 'développement économique'],
    response: "Kaolack est un important centre commercial, notamment grâce à son marché central qui est l'un des plus grands du Sénégal. La ville est également connue pour l'arachide, le sel, et diverses activités artisanales et commerciales."
  },
  {
    keywords: ['culture', 'patrimoine', 'tradition', 'culturel'],
    response: "Kaolack possède un riche patrimoine culturel avec de nombreux sites historiques et religieux. La ville est notamment connue pour ses mosquées historiques, son artisanat traditionnel, et ses célébrations culturelles qui rythment la vie de la communauté."
  },
  {
    keywords: ['mosquée', 'religieux', 'islam', 'spiritualité'],
    response: "Kaolack abrite plusieurs mosquées historiques importantes qui témoignent de la riche tradition religieuse de la ville. Ces lieux de culte sont des symboles du patrimoine architectural et spirituel de la région."
  },
  {
    keywords: ['personnalité', 'personnage', 'figure', 'notable', 'célèbre'],
    response: "Kaolack a vu naître et grandir de nombreuses personnalités qui ont marqué l'histoire du Sénégal dans les domaines de la politique, de la culture, de l'économie et de la religion. Vous pouvez découvrir ces figures emblématiques dans la section 'Personnalités'."
  },
  {
    keywords: ['population', 'habitants', 'citoyens', 'résidents'],
    response: "Kaolack compte plus de 100 000 habitants. La population de la ville est diverse et dynamique, contribuant au développement et à l'identité unique de la commune."
  },
  {
    keywords: ['fleuve', 'saloum', 'rivière', 'eau'],
    response: "Le fleuve Saloum joue un rôle crucial dans l'histoire et le développement de Kaolack. Il a facilité le commerce, l'agriculture et les échanges, faisant de Kaolack un carrefour commercial important."
  },
  {
    keywords: ['arachide', 'agriculture', 'culture agricole'],
    response: "L'arachide a été et reste une culture importante pour Kaolack et sa région. Cette activité agricole a contribué au développement économique de la ville et de ses environs."
  },
  {
    keywords: ['marché central', 'marché', 'commerce local'],
    response: "Le marché central de Kaolack est l'un des plus importants du Sénégal. C'est un lieu de rencontre, d'échange et de commerce qui reflète la vitalité économique et sociale de la ville."
  },
  {
    keywords: ['105 ans', 'anniversaire', 'célébration', 'fête'],
    response: "En 2025, Kaolack célèbre ses 105 ans d'existence. Cette célébration est l'occasion de se souvenir de l'histoire riche de la ville, de valoriser son patrimoine et de se tourner vers l'avenir avec fierté."
  },
  {
    keywords: ['développement', 'évolution', 'transformation', 'changement'],
    response: "Depuis sa fondation en 1920, Kaolack a connu une évolution remarquable. De village commercial à ville moderne, Kaolack continue de se développer tout en préservant son identité et son patrimoine culturel."
  },
  {
    keywords: ['artisanat', 'artisan', 'métier traditionnel'],
    response: "L'artisanat est une tradition importante à Kaolack. Les artisans perpétuent des savoir-faire ancestraux dans la poterie, le tissage, la maroquinerie et d'autres métiers qui font partie du patrimoine culturel de la ville."
  },
  {
    keywords: ['éducation', 'école', 'enseignement', 'formation'],
    response: "Kaolack dispose de plusieurs établissements d'enseignement qui contribuent à la formation des jeunes générations. L'éducation est un pilier important du développement de la ville."
  },
  {
    keywords: ['santé', 'hôpital', 'soins', 'médical'],
    response: "Kaolack dispose d'infrastructures de santé qui servent la population locale et régionale. Ces services médicaux sont essentiels au bien-être de la communauté."
  },
  {
    keywords: ['transport', 'communication', 'route', 'voie'],
    response: "Kaolack bénéficie d'une position stratégique avec de bonnes connexions routières. La ville est un carrefour important pour les transports et les communications dans la région."
  },
  // Personnalités importantes de Kaolack
  {
    keywords: ['serigne mboup', 'mboup', 'serigne'],
    response: "Serigne Mboup est une personnalité importante liée à Kaolack. Il fait partie des figures marquantes de l'histoire religieuse et culturelle de la ville. Pour obtenir des informations plus détaillées, je peux rechercher des informations spécifiques sur lui."
  },
  {
    keywords: ['cheikh ibrahima niass', 'ibrahima niass', 'el hadji ibrahima niass', 'cheikh ibra'],
    response: "Cheikh Ibrahima Niass (1900-1975) était un éminent érudit musulman et guide spirituel sénégalais, fondateur de la confrérie Tijaniyya Ibrahimiyya. Il a eu une influence considérable sur la vie religieuse et culturelle de Kaolack et du Sénégal."
  },
  {
    keywords: ['moustapha niass', 'niass'],
    response: "Moustapha Niass est une personnalité politique sénégalaise originaire de Kaolack. Il a occupé plusieurs postes importants dans la vie politique du Sénégal."
  },
  {
    keywords: ['samba ka', 'samba'],
    response: "Samba Ka est un artiste et personnalité culturelle liée à Kaolack. Il contribue à la promotion de la culture et des arts de la région."
  },
  {
    keywords: ['fatou kiné camara', 'camara'],
    response: "Fatou Kiné Camara est une personnalité liée à Kaolack. Pour obtenir des informations plus détaillées, je peux rechercher des informations spécifiques sur elle."
  },
  {
    keywords: ['alioune badara mbengue', 'mbengue'],
    response: "Alioune Badara Mbengue est une personnalité liée à Kaolack. Pour obtenir des informations plus détaillées, je peux rechercher des informations spécifiques sur lui."
  },
  {
    keywords: ['mame abdoulaye niass', 'mame bou kounta', 'kounta'],
    response: "Ces personnalités sont liées à l'histoire religieuse et culturelle de Kaolack. Pour obtenir des informations plus détaillées, je peux rechercher des informations spécifiques sur elles."
  }
];

// Réponses par défaut
const defaultResponses = [
  "Je suis là pour vous parler de l'histoire de Kaolack ! Posez-moi une question sur la ville, sa fondation, son patrimoine, ou ses personnalités.",
  "Je peux vous renseigner sur l'histoire de Kaolack depuis 1920. Que souhaitez-vous savoir ?",
  "N'hésitez pas à me poser des questions sur Kaolack : sa géographie, son économie, sa culture, ou ses 105 ans d'histoire !"
];

// Ajout d'un type pour la réponse enrichie
type BotApiResponse = { answer: string; source?: string; success?: boolean };

// Fonction pour détecter si la question concerne une personnalité ou un nom propre
const extractPersonName = (message: string): string | null => {
  // Liste de mots-clés qui indiquent qu'on parle d'une personne
  const personIndicators = ['qui est', 'parlez-moi de', 'connaissez-vous', 'informations sur', 'biographie', 'histoire de'];
  const lowerMessage = message.toLowerCase();
  
  // Vérifier si le message contient un indicateur de personne
  for (const indicator of personIndicators) {
    if (lowerMessage.includes(indicator)) {
      // Extraire le nom après l'indicateur
      const index = lowerMessage.indexOf(indicator);
      const afterIndicator = message.substring(index + indicator.length).trim();
      // Prendre les 2-3 premiers mots comme nom potentiel
      const words = afterIndicator.split(/\s+/).slice(0, 3);
      if (words.length > 0) {
        return words.join(' ');
      }
    }
  }
  
  // Si le message commence directement par un nom (majuscule) ou contient des noms connus
  const knownNames = ['serigne mboup', 'cheikh ibrahima niass', 'moustapha niass', 'samba ka', 'fatou kiné camara'];
  for (const name of knownNames) {
    if (lowerMessage.includes(name.toLowerCase())) {
      return name;
    }
  }
  
  // Si le message contient des mots qui ressemblent à des noms propres (commencent par majuscule)
  const words = message.split(/\s+/);
  const potentialNames = words.filter(word => word.length > 2 && /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß]/.test(word));
  if (potentialNames.length > 0 && potentialNames.length <= 3) {
    return potentialNames.join(' ');
  }
  
  return null;
};

const getBotResponse = async (userMessage: string): Promise<BotApiResponse> => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Recherche dans la base de connaissances locale
  for (const entry of knowledgeBase) {
    const hasKeyword = entry.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
    if (hasKeyword) {
      // Si c'est une réponse générique sur une personnalité, on peut aussi faire une recherche web
      if (entry.response.includes('Pour obtenir des informations plus détaillées')) {
        const personName = extractPersonName(userMessage);
        if (personName) {
          try {
            const searchResult = await apiService.searchKaolackInfo(`${personName} Kaolack`);
            if (searchResult.success && searchResult.answer) {
              return { answer: searchResult.answer, source: searchResult.source || 'web' };
            }
          } catch (error) {
            console.error('Erreur lors de la recherche web:', error);
          }
        }
      }
      return { answer: entry.response, source: 'local' };
    }
  }
  
  // Réponses pour les salutations
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('bonsoir')) {
    return { answer: "Bonjour ! Je suis ravi de vous aider à découvrir l'histoire de Kaolack. Je peux rechercher des informations sur Internet pour répondre à vos questions. Que souhaitez-vous savoir sur notre ville ?", source: 'local' };
  }
  if (lowerMessage.includes('merci') || lowerMessage.includes('remerci')) {
    return { answer: "De rien ! N'hésitez pas si vous avez d'autres questions sur l'histoire de Kaolack. Je suis là pour vous aider !", source: 'local' };
  }
  if (lowerMessage.includes('au revoir') || lowerMessage.includes('bye') || lowerMessage.includes('à bientôt')) {
    return { answer: "Au revoir ! J'espère avoir pu vous renseigner sur l'histoire de Kaolack. Revenez quand vous voulez !", source: 'local' };
  }
  
  // Détecter si la question concerne une personnalité
  const personName = extractPersonName(userMessage);
  let searchQuery = userMessage;
  
  // Si on a détecté un nom de personne, construire une requête plus intelligente
  if (personName) {
    // Si le message ne contient pas déjà "Kaolack", l'ajouter pour contextualiser
    if (!lowerMessage.includes('kaolack')) {
      searchQuery = `${personName} Kaolack`;
    } else {
      searchQuery = userMessage;
    }
  } else if (!lowerMessage.includes('kaolack')) {
    // Si la question ne mentionne pas Kaolack, l'ajouter pour contextualiser
    searchQuery = `${userMessage} Kaolack`;
  }
  
  // Rechercher sur Internet avec la requête améliorée
  try {
    const searchResult = await apiService.searchKaolackInfo(searchQuery);
    if (searchResult.success && searchResult.answer) {
      return { answer: searchResult.answer, source: searchResult.source || 'web' };
    }
  } catch (error) {
    console.error('Erreur lors de la recherche web:', error);
  }
  
  // Réponse par défaut si la recherche web échoue
  return {
    answer: "Je n'ai pas trouvé d'informations spécifiques sur ce sujet dans ma base de connaissances. Pouvez-vous reformuler votre question ou être plus précis ? Par exemple : 'Quand Kaolack a-t-elle été fondée ?' ou 'Parlez-moi de l'économie de Kaolack'.",
    source: 'default',
  };
};

interface KaolackHistoryBotProps {
  minimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
}

export const KaolackHistoryBot = ({ minimized = false, onMinimize, onClose }: KaolackHistoryBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Bonjour ! Je suis le bot de l'histoire de Kaolack. Je peux vous renseigner sur les 105 ans d'histoire de notre ville. Posez-moi une question !",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(true); // Commence minimisé par défaut
  const [isOpen, setIsOpen] = useState(false); // État pour savoir si le bot est ouvert
  const [isLoading, setIsLoading] = useState(false); // État de chargement pour la recherche web
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const questionText = input.trim();
    setInput('');
    setIsLoading(true);

    // Afficher un message de chargement
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Recherche d\'informations...',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Obtenir la réponse du bot (peut utiliser la recherche web)
      const botResponse = await getBotResponse(questionText);
      // Remplacer le message de chargement par la vraie réponse
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(msg => msg.id === loadingMessage.id);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = {
            id: loadingMessage.id,
            text: botResponse.answer + (botResponse.source ? `\n\nSource : ${botResponse.source}` : ''),
            sender: 'bot',
            timestamp: new Date()
          };
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse:', error);
      // Remplacer le message de chargement par un message d'erreur
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(msg => msg.id === loadingMessage.id);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = {
            id: loadingMessage.id,
            text: "Désolé, j'ai rencontré une erreur lors de la recherche. Pouvez-vous reformuler votre question ?",
            sender: 'bot',
            timestamp: new Date()
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      // Ouvrir le bot
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      // Fermer le bot (retour à la bulle)
      setIsOpen(false);
      setIsMinimized(true);
    }
    onMinimize?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(true);
    onClose?.();
  };

  // Afficher la bulle si le bot est minimisé
  if (isMinimized || !isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleToggle}
          className="rounded-full h-16 w-16 shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-110"
          size="icon"
          title="Parler avec le bot de l'histoire de Kaolack"
        >
          <Bot className="h-7 w-7 text-white" />
        </Button>
        {/* Animation de notification */}
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[90vw] sm:w-96 md:w-[420px] h-[500px] sm:h-[600px] shadow-2xl z-50 flex flex-col border-2 border-primary/20">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-base sm:text-lg">Bot Histoire de Kaolack</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleToggle}
              title="Minimiser"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleClose}
              title="Fermer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="border-t p-3 bg-muted/50">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez une question sur l'histoire de Kaolack..."
              className="flex-1 text-sm"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="flex-shrink-0"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Exemples : "Quand Kaolack a-t-elle été fondée ?" • "Parlez-moi de l'économie"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KaolackHistoryBot;

