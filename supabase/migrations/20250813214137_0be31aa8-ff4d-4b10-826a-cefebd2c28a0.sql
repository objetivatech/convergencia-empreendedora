-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  action_url text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS policies
CREATE POLICY "Users can view their own notifications" 
ON notifications 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON notifications 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id uuid,
  notification_type text,
  notification_title text,
  notification_message text,
  notification_data jsonb DEFAULT '{}',
  notification_action_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, data, action_url
  ) VALUES (
    target_user_id, notification_type, notification_title, 
    notification_message, notification_data, notification_action_url
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to notify business owners of new reviews
CREATE OR REPLACE FUNCTION notify_business_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  business_owner_id uuid;
  business_name text;
BEGIN
  -- Get business owner and name
  SELECT owner_id, name INTO business_owner_id, business_name
  FROM businesses 
  WHERE id = NEW.business_id;
  
  -- Create notification if owner exists
  IF business_owner_id IS NOT NULL THEN
    PERFORM create_notification(
      business_owner_id,
      'new_review',
      'Nova avaliação recebida',
      format('Seu negócio "%s" recebeu uma nova avaliação de %s estrelas.', 
             business_name, NEW.rating),
      jsonb_build_object(
        'business_id', NEW.business_id,
        'review_id', NEW.id,
        'rating', NEW.rating,
        'reviewer_name', NEW.reviewer_name
      ),
      format('/diretorio/%s', NEW.business_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new reviews
CREATE TRIGGER notify_business_review_trigger
  AFTER INSERT ON business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_business_review();