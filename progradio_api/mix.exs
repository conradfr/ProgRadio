defmodule ProgRadioApi.MixProject do
  use Mix.Project

  def project do
    [
      app: :progradio_api,
      version: "0.5.0",
      elixir: "~> 1.17",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      compilers: [:phoenix_live_view] ++ Mix.compilers(),
      releases: [
        prod: [
          include_executables_for: [:unix],
          applications: [runtime_tools: :permanent]
        ]
      ]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {ProgRadioApi.Application, []},
      extra_applications: [:elixir_xml_to_map, :logger, :runtime_tools, :os_mon]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.8"},
      {:phoenix_ecto, "~> 4.7"},
      {:ecto_sql, "~> 3.13"},
      {:postgrex, ">= 0.0.0"},
      {:swoosh, "~> 1.19"},
      {:finch, "~> 0.20"},
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.0"},
      {:gettext, "~> 0.26.2"},
      {:jason, "~> 1.4"},
      {:dns_cluster, "~> 0.2.0"},
      {:bandit, "~> 1.8"},
      {:hackney, "~> 1.21.0"},
      {:httpoison, "~> 2.2", override: true},
      {:tzdata, "~> 1.1"},
      {:cors_plug, "~> 3.0"},
      {:remote_ip, "~> 1.2.0"},
      {:dns, "~> 2.4.0"},
      {:quantum, "~> 3.5.0"},
      {:redix, ">= 0.0.0"},
      {:mogrify, "~> 0.8.0"},
      {:dialyxir, "~> 1.0", only: [:dev], runtime: false},
      {:broadway, "~> 1.2.0"},
      # {:off_broadway_redis, "~> 0.4.3"},
      #      # Until off_broadway_redis 1.0.0 is fixed and tagged
      {:off_broadway_redis,
       git: "https://github.com/conradfr/off_broadway_redis.git", branch: "1.0.0"},
      {:timex, "~> 3.7.13"},
      {:elixir_xml_to_map, "~> 3.0"},
      {:recase, "~> 0.7"},
      #      {:shoutcast, "~> 0.1.0"},
      {:shoutcast, git: "https://github.com/conradfr/shoutcast_ex.git", branch: "hackney_close"},
      {:floki, "~> 0.38.0"},
      {:canada, "~> 2.0"},
      {:nebulex, "~> 2.6"},
      {:decorator, "~> 1.3"},
      {:observer_cli, "~> 1.7"},
      {:ex_cldr, "~> 2.43"},
      {:ex_cldr_territories, "~> 2.11.0"},
      {:ex_cldr_collation, "~> 0.7.5"},
      {:req, "~> 0.5.0"},
      {:phoenix_live_dashboard, "~> 0.8"},
      {:ecto_psql_extras, "~> 0.8"},
      {:hls, "~> 0.1.0"},
      {:ex2ms, "~> 1.0"},
      {:meilisearch_ex, "~> 1.2.1"},
      {:goal, "~> 1.2"},
      {:sentry, "~> 11.0.0"},
      {:eventsource_ex, "~> 2.0.0"},
      {:lazy_html, ">= 0.0.0", only: :test},
      {:igniter, "~> 0.6", only: [:dev, :test]},
      {:openai_ex, "~> 0.9.17"},
      {:oban, "~> 2.19"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "ecto.setup"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"]
    ]
  end
end
