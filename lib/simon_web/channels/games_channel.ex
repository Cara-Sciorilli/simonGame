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
          length(game.players) == 1 ->
            Game.add_player(game, name)
          name in game.players ->
            game
          true ->
            {:error, %{reason: "too many players"}}
        end
      if game != {:error, %{reason: "too many players"}} do
        BackupAgent.put(game_name, game)
        {:ok, %{"join" => game_name, "game" => Game.client_view(game)}, socket}
      else
        {:error, %{reason: "too many players"}}
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
    #push_update!(game_name, player)
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end

  def handle_in("turn_off", _params, socket) do
    game_name = socket.assigns[:game]
    player = socket.assigns[:name]
    game = BackupAgent.get(game_name)
    |> Game.turn_off()
    BackupAgent.put(game_name, game)
    push_update!(game_name, player)
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end

  def handle_out("update", game, socket) do
    push socket, "update", game
    {:noreply, socket}
  end

  def push_update!(game_name, name) do
    game = BackupAgent.get(game_name)
    SimonWeb.Endpoint.broadcast!("game:#{game_name}", "update", game)
  end

  #Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
