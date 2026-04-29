defmodule ProgRadioApi.SongProvider.FrancebleuPaysbasque do
  require Logger
  alias ProgRadioApi.SongProvider.FranceBleu

  @behaviour ProgRadioApi.SongProvider

  @impl true
  defdelegate has_custom_refresh(name), to: FranceBleu

  @impl true
  defdelegate get_refresh(name, data, default_refresh), to: FranceBleu

  @impl true
  def get_data(_name, last_data) do
    FranceBleu.get_data("song:france_bleu_paysbasque", last_data)
  end

  @impl true
  defdelegate get_song(name, data, last_song), to: FranceBleu
end
