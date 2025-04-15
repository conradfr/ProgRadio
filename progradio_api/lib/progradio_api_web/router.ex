defmodule ProgRadioApiWeb.Router do
  use ProgRadioApiWeb, :router
  import Phoenix.LiveDashboard.Router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug RemoteIp,
      clients: ~w[10.0.2.2/32]

    plug :accepts, ["json"]
    plug ProgRadioApiWeb.Plugs.ApiKeyAuth
  end

  pipeline :admins_only do
    plug :admin_basic_auth
  end

  #  scope "/api", ProgRadioApiWeb do
  #    pipe_through :api
  #  end

  scope "/", ProgRadioApiWeb do
    pipe_through :api

    resources "/schedule/:day", ScheduleController
    resources "/stream", StreamController
    resources "/schedule", ScheduleController, only: [:create]
    resources "/radios", RadioController, only: [:index]
    resources "/listening_session", ListeningSessionController, only: [:create, :update]

    get "/config", ConfigController, :index
    get "/radios/list", RadioController, :list
    get "/countries", CountryController, :list

    post "/stream_error/:id", StreamController, :playing_error
    post "/search_term", StreamController, :search_term

    delete "/admin/cache/streams", AdminController, :empty_cache_stream
    get "/admin/search/index", AdminController, :search_index
    get "/admin/image/stream/import", AdminController, :import_stream_image
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:progradio_api, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    # import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      # live_dashboard "/dashboard", metrics: ProgRadioApiWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  if Mix.env() == :dev do
    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard"
    end
  else
    scope "/" do
      pipe_through [:browser, :admins_only]
      live_dashboard "/dashboard"
    end
  end

  defp admin_basic_auth(conn, _opts) do
    username = System.fetch_env!("AUTH_USERNAME")
    password = System.fetch_env!("AUTH_PASSWORD")
    Plug.BasicAuth.basic_auth(conn, username: username, password: password)
  end
end
