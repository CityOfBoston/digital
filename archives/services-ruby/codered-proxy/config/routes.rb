Rails.application.routes.draw do
  get '/admin/ok', to: proc { [200, {}, ['']] }

  namespace :api, :defaults => {:format => :json} do
    resources :subscriptions
  end

  root to: "subscription#index"
end
