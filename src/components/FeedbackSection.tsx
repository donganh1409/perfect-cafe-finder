
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, MessagesSquare } from "lucide-react";

interface FeedbackSectionProps {
  onFeedback: (isPositive: boolean, comment?: string) => void;
}

export const FeedbackSection = ({ onFeedback }: FeedbackSectionProps) => {
  const [feedbackState, setFeedbackState] = useState<'initial' | 'positive' | 'negative' | 'comment'>('initial');
  const [comment, setComment] = useState('');

  const handlePositiveFeedback = () => {
    setFeedbackState('positive');
    onFeedback(true);
  };

  const handleNegativeFeedback = () => {
    setFeedbackState('negative');
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      onFeedback(false, comment);
      setFeedbackState('comment');
    }
  };

  return (
    <div className="mt-12">
      {feedbackState === 'initial' && (
        <div className="mx-auto max-w-md text-center p-5 rounded-xl glass-accent animate-fadeIn">
          <h3 className="text-base font-medium text-foreground mb-3">Were these recommendations helpful?</h3>
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePositiveFeedback}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Yes, perfect!</span>
            </button>
            <button
              onClick={handleNegativeFeedback}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>Not quite</span>
            </button>
          </div>
        </div>
      )}

      {feedbackState === 'positive' && (
        <div className="mx-auto max-w-md text-center p-5 rounded-xl glass-accent animate-fadeIn">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <h3 className="text-base font-medium text-green-700">Thank you for your feedback!</h3>
          <p className="text-sm text-muted-foreground mt-1">We're glad we could help you find the perfect spot.</p>
        </div>
      )}

      {feedbackState === 'negative' && (
        <div className="mx-auto max-w-md text-center p-5 rounded-xl glass-accent animate-fadeIn">
          <h3 className="text-base font-medium text-foreground mb-3">How can we improve our recommendations?</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Please let us know what you were looking for..."
            className="w-full px-3 py-2 rounded-lg border border-input focus:border-primary/50 outline-none focus:ring-2 focus:ring-primary/20 mb-3 h-24 resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleCommentSubmit}
              disabled={!comment.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <MessagesSquare className="w-4 h-4" />
              <span>Submit feedback</span>
            </button>
          </div>
        </div>
      )}

      {feedbackState === 'comment' && (
        <div className="mx-auto max-w-md text-center p-5 rounded-xl glass-accent animate-fadeIn">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MessagesSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-medium text-foreground">Thank you for your feedback!</h3>
          <p className="text-sm text-muted-foreground mt-1">Your insights help us improve our recommendations.</p>
        </div>
      )}
    </div>
  );
};
