defmodule ProgRadioApi.SongProvider.Rfm do
  require Logger

  @behaviour ProgRadioApi.SongProvider

  @impl true
  def has_custom_refresh(), do: false

  @impl true
  def get_refresh(_name, _data, _default_refresh), do: nil

  @impl true
  def get_data(_name) do
    HTTPoison.get!(
      "http://directradio.rfm.fr/rfm/now/3",
      [],
      ssl: [ciphers: :ssl.cipher_suites(), versions: [:"tlsv1.2", :"tlsv1.1", :tlsv1]]
    )
    |> Map.get(:body)
    |> Jason.decode!()
    |> Map.get("current", %{})
  end

  @impl true
  def get_song(name, data) do
    case data do
      nil ->
        Logger.error("Data provider - #{name}: error fetching song data")
        %{}

      _ ->
        %{interpreter: data["artist"], title: data["title"]}
    end
  end
end
