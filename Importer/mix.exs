defmodule Importer.Mixfile do
  use Mix.Project

  def project do
    [
      app: :importer,
      description: "Importer daemon",
      version: "0.2.0",
      elixir: "~> 1.8",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      releases: [
        prod: [
          include_executables_for: [:unix],
          applications: [runtime_tools: :permanent],
          include_erts: false
        ],
      ]
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger],
      mod: {Importer, []},
      env: []
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:redix, ">= 0.0.0"},
      {:jason, "~> 1.1"},
      {:postgrex, ">= 0.0.0"},
      {:ecto_sql, "~> 3.2"},
      {:timex, "~> 3.5"},
      {:httpoison, "~> 1.6.0"},
      {:dialyxir, "~> 0.5", only: [:dev], runtime: false}
    ]
  end
end
