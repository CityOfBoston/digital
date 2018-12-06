module ApplicationHelper
  def patterns_path
    ENV['PATTERNS_PATH'] || 'https://patterns.boston.gov'
  end
end
