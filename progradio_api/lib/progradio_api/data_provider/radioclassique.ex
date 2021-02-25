defmodule ProgRadioApi.DataProvider.Radioclassique do
  require Logger

  @behaviour ProgRadioApi.DataProvider

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(_name) do
    HTTPoison.get!(
      "https://d3gf3bsqck8svl.cloudfront.net/direct-metadata/current.json",
      [],
      ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
    )
    |> Map.get(:body)
    |> Jason.decode!()
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.error("Data provider - #{name}: error fetching song data")
        %{}

      _ ->
        case Map.get(data, "duree") do
          nil ->
            Logger.debug("Data provider - #{name}: not real current song")
            nil

          _ ->
            %{interpreter: data["auteur"], title: data["titre"]}
        end
    end
  end
end
