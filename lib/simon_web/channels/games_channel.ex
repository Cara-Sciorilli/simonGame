defmodule SimonWeb.GamesChannel do
  use SimonWeb, :channel

  alias Simon.Game
  alias Simon.BackupAgent

  intercept ["update"]

  def join("games:" <> game_name, %{"name" => name}, socket) do
    if authorized?(name) do
      game = BackupAgent.get(game_name)
      socket = socket
      |> assign(:game, game_name)
      |> assign(:name, name)
      game =
        cond do
          game == nil ->
            Game.new(name)
          name in game.players ->
            game
          game.pattern != [] ->
            {:error, %{reason: "Game already started"}}
          true ->
            Game.add_player(game, name)
        end
      if game != {:error, %{reason: "Game already started"}} do
        BackupAgent.put(game_name, game)
        {:ok, %{"join" => game_name, "game" => Game.client_view(game)}, socket}
      else
        {:error, %{reason: "Game already started"}}
      end
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("guess", %{"color" => color}, socket) do
    game_name = socket.assigns[:game]
    player = socket.assigns[:name]
    game = BackupAgent.get(game_name)
    |> Game.guess(player, color)
    BackupAgent.put(game_name, game)
    push_update!(game_name, socket)
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end

  def handle_in("turn_off", _params, socket) do
    game_name = socket.assigns[:game]
    game = BackupAgent.get(game_name)
    |> Game.turn_off()
    BackupAgent.put(game_name, game)
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end

  def handle_in("reset_alert", _params, socket) do
    game_name = socket.assigns[:game]
    game = BackupAgent.get(game_name)
    |> Game.reset_alert()
    BackupAgent.put(game_name, game)
  end

  def handle_out("update", game, socket) do
    push(socket, "update", game)
    {:noreply, socket}
  end

  def push_update!(game_name, socket) do
    game = BackupAgent.get(game_name)
    broadcast!(socket, "update", game)
  end

  #Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
