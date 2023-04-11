defmodule ProgRadioApi.MixProject do
  use Mix.Project

  def project do
    [
      app: :progradio_api,
      version: "0.3.0",
      elixir: "~> 1.14",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
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
      extra_applications: [:elixir_xml_to_map, :logger, :runtime_tools]
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
      {:phoenix, "~> 1.7.2"},
      {:phoenix_ecto, "~> 4.4"},
      {:ecto_sql, "~> 3.6"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_live_dashboard, "~> 0.7.2"},
      {:swoosh, "~> 1.3"},
      {:finch, "~> 0.13"},
      {:telemetry_metrics, "~> 0.6"},
      {:telemetry_poller, "~> 1.0"},
      {:gettext, "~> 0.20"},
      {:jason, "~> 1.2"},
      {:plug_cowboy, "~> 2.5"},
      {:httpoison, "~> 1.8"},
      {:tzdata, "~> 1.1.1"},
      {:cors_plug, "~> 2.0"},
      {:remote_ip, "~> 1.0.0"},
      {:dns, "~> 2.2.0"},
      {:quantum, "~> 3.5.0"},
      {:redix, ">= 0.0.0"},
      {:mogrify, "~> 0.8.0"},
      {:dialyxir, "~> 1.0", only: [:dev], runtime: false},
      {:broadway, "~> 1.0.0"},
      # {:off_broadway_redis, "~> 0.4.3"},
      #      # Until off_broadway_redis 1.0.0 is fixed and tagged
      {:off_broadway_redis,
       git: "https://github.com/conradfr/off_broadway_redis.git", branch: "1.0.0"},
      {:timex, "~> 3.7"},
      {:elixir_xml_to_map, "~> 2.0"},
      {:recase, "~> 0.5"},
      {:shoutcast, "~> 0.1.0"},
      {:floki, "~> 0.32.0"},
      {:canada, "~> 2.0"},
      {:nebulex, "~> 2.3"},
      {:decorator, "~> 1.3"},
      {:observer_cli, "~> 1.7"},
      {:request_cache_plug, "~> 0.2"},
      #      {:request_cache_plug,
      #       git: "https://github.com/conradfr/request_cache_plug", branch: "main"},
      {:ex_cldr, "~> 2.33"},
      {:ex_cldr_territories, "~> 2.0"},
      {:ex_cldr_collation, "~> 0.7.0"}
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
