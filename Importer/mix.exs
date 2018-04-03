defmodule Importer.Mixfile do
  use Mix.Project

  def project do
    [
      app: :importer,
      description: "Importer daemon",
      version: "0.1.0",
      elixir: "~> 1.5",
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
      {:poison, "~> 3.1"},
      {:postgrex, ">= 0.0.0"},
      {:ecto, "~> 2.2"},
      {:timex, "~> 3.2"},
      {:httpoison, "~> 1.0.0"},
      {:distillery, "~> 1.5", runtime: false},
       {:dialyxir, "~> 0.5", only: [:dev], runtime: false}
    ]
  end
end
