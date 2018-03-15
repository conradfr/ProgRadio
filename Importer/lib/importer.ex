defmodule Importer do
  use Application

  require Logger

  @moduledoc """
  Documentation for Importer.
  """

  def start(_type, _args) do
    Logger.info("Starting Importer ...")
    Importer.Supervisor.start_link()
  end
end
