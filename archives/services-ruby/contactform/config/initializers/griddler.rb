Griddler.configure do |config|
  config.processor_class = EmailProcessor # CommentViaEmail
  config.email_class = Griddler::Email # MyEmail
  config.processor_method = :process # :create_comment (A method on CommentViaEmail)
  config.reply_delimiter = '-- REPLY ABOVE THIS LINE --'
  config.email_service = :postmark # :cloudmailin, :postmark, :mandrill, :mailgun
end
