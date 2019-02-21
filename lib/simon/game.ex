defmodule Simon.Game do
  def new(player1) do
    %{
      players: [player1],
      currentPlayerInd: 0,
      pattern: [],
      clickedColor: "",
      expectedColorInd: 0,
      loser: "",
      winner: false,
    }
  end

  def add_player(game, newPlayer) do
    game
    |> Map.put(:players, game.players ++ [newPlayer])
  end

  def client_view(game) do
    cc = game.clickedColor
    cp = Enum.at(game.players, game.currentPlayerInd)
    l = game.loser
    w = game.winner
    %{
      color: cc,
      currentPlayer: cp,
      loser: l,
      winner: w,
    }
  end

  def turn_off(game) do
    game
    |> Map.put(:clickedColor, "")
  end

  def guess(game, player, color) do
    if (player == Enum.at(game.players, game.currentPlayerInd) &&     length(game.players) != 1) do
      cond do
        game.expectedColorInd == length(game.pattern) ->
          newIndex =
            if game.currentPlayerInd == (length(game.players) - 1)  do
              0
            else
              game.currentPlayerInd + 1
            end
          game
          |> Map.put(:pattern, game.pattern ++ [color])
          |> Map.put(:currentPlayerInd, newIndex)
          |> Map.put(:expectedColorInd, 0)
          |> Map.put(:clickedColor, color)
        Enum.at(game.pattern, game.expectedColorInd) == color ->
          game
          |> Map.put(:expectedColorInd, game.expectedColorInd + 1)
          |> Map.put(:clickedColor, color)
        true ->
          lessPlayers = List.delete(game.players, player)
          if length(lessPlayers) == 1 do
            game
            |> Map.put(:winner, hd(lessPlayers))
            |> Map.put(:loser, player)
            |> Map.put(:players, lessPlayers)
            |> Map.put(:clickedColor, color)
          else
            game
            |> Map.put(:expectedColorInd, 0)
            |> Map.put(:loser, player)
            |> Map.put(:players, lessPlayers)
            |> Map.put(:clickedColor, color)
          end
      end
    else
        game
    end
  end
end
