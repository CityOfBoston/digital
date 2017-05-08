Rails.application.routes.draw do
  namespace :api, :defaults => {:format => :json} do
    resources :subscriptions
  end
end
