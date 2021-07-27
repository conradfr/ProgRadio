defmodule ProgRadioApiWeb.Plugs.Auth do
  import Plug.Conn
  import Ecto.Query, warn: false, only: [from: 2]
  alias ProgRadioApi.Repo
  alias ProgRadioApi.ApiKey
  alias ProgRadioApi.ApiUser

  def init(options), do: options

  def call(conn, _opts) do
    with api_keys when api_keys != [] <- get_req_header(conn, "x-api-key"),
         api_key_string <- hd(api_keys),
         api_key when api_key != nil <-
           Repo.get_by(ApiKey, id: api_key_string, enabled: true)
           |> Repo.preload(api_user: from(au in ApiUser, where: au.enabled == true)),
         api_user when api_user != nil <- api_key.api_user do
      conn
      |> put_private(:api_key, api_key)
      |> put_private(:api_user, api_user)
    else
      _ ->
        conn
    end
  end
end
