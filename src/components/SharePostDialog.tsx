import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Facebook, Twitter, Linkedin, Link2, MessageCircle } from "lucide-react";

interface SharePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postTitle: string;
  postContent: string;
  postUrl?: string;
  postId?: number;
}

const SharePostDialog = ({ 
  open, 
  onOpenChange, 
  postTitle, 
  postContent,
  postUrl,
  postId 
}: SharePostDialogProps) => {
  // URL de base de l'application (à adapter selon votre configuration)
  const baseUrl = window.location.origin;
  // Générer l'URL du post spécifique si postId est fourni
  const shareUrl = postUrl || (postId ? `${baseUrl}/post/${postId}` : `${baseUrl}/feed`);
  
  const shareText = `${postTitle}\n\n${postContent.slice(0, 100)}${postContent.length > 100 ? '...' : ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Lien copié dans le presse-papier !");
    } catch (error) {
      toast.error("Erreur lors de la copie du lien");
    }
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager cette histoire</DialogTitle>
          <DialogDescription>
            Partagez cette publication sur vos réseaux sociaux préférés
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button
            onClick={handleShareFacebook}
            className="w-full justify-start gap-3"
            variant="outline"
          >
            <Facebook className="h-5 w-5 text-blue-600" />
            Partager sur Facebook
          </Button>

          <Button
            onClick={handleShareTwitter}
            className="w-full justify-start gap-3"
            variant="outline"
          >
            <Twitter className="h-5 w-5 text-sky-500" />
            Partager sur Twitter
          </Button>

          <Button
            onClick={handleShareLinkedIn}
            className="w-full justify-start gap-3"
            variant="outline"
          >
            <Linkedin className="h-5 w-5 text-blue-700" />
            Partager sur LinkedIn
          </Button>

          <Button
            onClick={handleShareWhatsApp}
            className="w-full justify-start gap-3"
            variant="outline"
          >
            <MessageCircle className="h-5 w-5 text-green-600" />
            Partager sur WhatsApp
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou
              </span>
            </div>
          </div>

          <Button
            onClick={handleCopyLink}
            className="w-full justify-start gap-3"
            variant="outline"
          >
            <Link2 className="h-5 w-5" />
            Copier le lien
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePostDialog;

