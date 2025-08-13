import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, MessageSquare, ThumbsUp, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
  helpful_count: number;
  verified: boolean;
}

interface BusinessRating {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

interface BusinessReviewsProps {
  businessId: string;
  businessName: string;
}

const BusinessReviews = ({ businessId, businessName }: BusinessReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<BusinessRating>({
    average_rating: 0,
    total_reviews: 0,
    rating_distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    reviewer_name: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    fetchRating();
  }, [businessId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('business_reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    }
  };

  const fetchRating = async () => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_business_rating', { business_uuid: businessId });

      if (error) throw error;
      if (data && data.length > 0) {
        setRating({
          ...data[0],
          rating_distribution: data[0].rating_distribution as BusinessRating['rating_distribution']
        });
      }
    } catch (error) {
      console.error('Erro ao buscar rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.reviewer_name || !newReview.rating) {
      toast({
        title: "Erro",
        description: "Nome e avaliação são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const reviewData = {
        business_id: businessId,
        reviewer_id: user?.id || null,
        reviewer_name: newReview.reviewer_name,
        rating: newReview.rating,
        title: newReview.title || null,
        comment: newReview.comment || null
      };

      const { error } = await supabase
        .from('business_reviews')
        .insert([reviewData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Avaliação enviada com sucesso!",
      });

      // Reset form
      setNewReview({
        rating: 0,
        title: '',
        comment: '',
        reviewer_name: ''
      });
      
      setDialogOpen(false);
      
      // Refresh data
      fetchReviews();
      fetchRating();

    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar avaliação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (stars: number, count: number) => {
    const percentage = rating.total_reviews > 0 ? (count / rating.total_reviews) * 100 : 0;
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-3">{stars}</span>
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-400 h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-8 text-xs text-muted-foreground">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Avaliações
            </CardTitle>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Avaliar Negócio</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Avaliar {businessName}</DialogTitle>
                  <DialogDescription>
                    Compartilhe sua experiência com outros clientes
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reviewer_name">Seu Nome *</Label>
                    <Input
                      id="reviewer_name"
                      value={newReview.reviewer_name}
                      onChange={(e) => setNewReview({ ...newReview, reviewer_name: e.target.value })}
                      placeholder="Como você gostaria de aparecer"
                    />
                  </div>
                  
                  <div>
                    <Label>Avaliação *</Label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="p-1"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= newReview.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Título (opcional)</Label>
                    <Input
                      id="title"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      placeholder="Resumo da sua experiência"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="comment">Comentário (opcional)</Label>
                    <Textarea
                      id="comment"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Conte mais sobre sua experiência..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={submitting || !newReview.reviewer_name || !newReview.rating}
                      className="flex-1"
                    >
                      {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {rating.total_reviews > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{rating.average_rating}</div>
                {renderStars(rating.average_rating, 'lg')}
                <p className="text-sm text-muted-foreground mt-2">
                  {rating.total_reviews} avaliação{rating.total_reviews !== 1 ? 'ões' : ''}
                </p>
              </div>
              
              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => 
                  renderRatingBar(stars, rating.rating_distribution[stars.toString() as keyof typeof rating.rating_distribution])
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Ainda não há avaliações</p>
              <p className="text-sm text-muted-foreground">Seja o primeiro a avaliar este negócio!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Avaliações dos Clientes</h3>
          
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.reviewer_name}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {renderStars(review.rating, 'sm')}
                        <span>•</span>
                        <span>{new Date(review.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {review.title && (
                  <h4 className="font-medium mb-2">{review.title}</h4>
                )}
                
                {review.comment && (
                  <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <ThumbsUp className="h-3 w-3" />
                    Útil ({review.helpful_count})
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessReviews;