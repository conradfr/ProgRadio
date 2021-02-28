defmodule ProgRadioApiWeb.Router do
  use ProgRadioApiWeb, :router

  pipeline :api do
    plug CORSPlug
    plug RemoteIp,
         clients: ~w[10.0.2.2/32]
    plug :accepts, ["json"]
  end

  scope "/", ProgRadioApiWeb do
    pipe_through :api

    resources "/listening_session", ListeningSessionController, except: [:new]
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through [:fetch_session, :protect_from_forgery]
      live_dashboard "/dashboard", metrics: ProgRadioApiWeb.Telemetry
    end
  end
end
