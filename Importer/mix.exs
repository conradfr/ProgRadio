defmodule Importer.Mixfile do
  use Mix.Project

  def project do
    [
      app: :importer,
      description: "Importer daemon",
      version: "0.2.0",
      elixir: "~> 1.7",
      start_permanent: Mix.env() == :prod,
      deps: deps()
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
      {:ecto_sql, "~> 3.0"},
      {:timex, "~> 3.2"},
      {:httpoison, "~> 1.0.0"},
      {:gen_stage, "~> 0.13"},
      {:distillery, "~> 2.0"},
      {:dialyxir, "~> 0.5", only: [:dev], runtime: false}
    ]
  end
end
